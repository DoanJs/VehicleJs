import { signInWithEmailAndPassword } from "firebase/auth";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RowComponent,
  SectionComponent,
  SpaceComponent,
  SpinnerComponent,
  TextComponent,
} from "../../components";
import { colors } from "../../constants/colors";
import {
  handleToastError,
  handleToastSuccess,
} from "../../constants/handleToast";
import { sizes } from "../../constants/sizes";
import { validateEmail } from "../../constants/validateEmailPhone";
import { auth } from "../../firebase.config";

export default function LoginScreen() {
  const [disable, setDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  // const [remember, setRemember] = useState(false);

  useEffect(() => {
    if (form.email && validateEmail(form.email) && form.password) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [form]);

  const handleLogin = async () => {
    setIsLoading(true);
    await signInWithEmailAndPassword(auth, form.email, form.password)
      .then(async (userCredential) => {
        // Signed in
        setIsLoading(false);
        // const user = userCredential.user;
        // if (remember) {
        //   await localforage.setItem("user", user.email as string);
        // }
        handleToastSuccess(
          `Xin chào bạn ${userCredential.user.displayName} đã đăng nhập thành công !`,
        );
      })
      .catch(() => {
        handleToastError("Đăng nhập thất bại, tài khoản không chính xác !");
        setIsLoading(false);
      });
  };
  return (
    <SectionComponent
      styles={{
        padding: "2%",
        background: colors.primary,
        display: "flex",
        flex: 1,
        height: sizes.height,
      }}
    >
      <RowComponent
        styles={{
          //   background: colors.primaryLight,
          // borderRadius: 10,
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {/* ben trai */}
        <RowComponent
          styles={{
            height: "100%",
            width: "100%",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingRight: 32,
          }}
        >
          <RowComponent
            styles={{
              display: "flex",
              flexDirection: "column",
              background: colors.bacground,
              padding: 30,
              borderRadius: 10,
              height: "80%",
              width: "50%",
            }}
          >
            <TextComponent
              text="Đăng nhập"
              size={sizes.title}
              styles={{ fontWeight: "bold" }}
            />
            <SpaceComponent height={20} />
            <div style={{ width: "100%" }}>
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Email
              </label>
              <input
                onChange={(val) =>
                  setForm({ ...form, email: val.target.value })
                }
                type="email"
                className="form-control"
              />
            </div>
            <SpaceComponent height={10} />
            <div style={{ width: "100%" }}>
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Mật khẩu
              </label>
              <input
                onChange={(val) =>
                  setForm({ ...form, password: val.target.value })
                }
                type="password"
                className="form-control"
              />
            </div>

            <SpaceComponent height={6} />
            <div
              className="form-check"
              style={{ width: "100%", margin: "10px 0" }}
            >
              <input
                onChange={() => {}}
                className="form-check-input"
                type="checkbox"
                value=""
                id={`flexCheckChecked`}
              />
              <label htmlFor={`flexCheckChecked`}> Ghi nhớ đăng nhập</label>
            </div>

            <button
              onClick={!disable ? handleLogin : undefined}
              style={{
                width: "100%",
                background: disable ? colors.gray : colors.orange,
                borderColor: disable ? colors.gray : colors.orange,
                fontWeight: "bold",
              }}
              type="button"
              className="btn btn-primary"
            >
              {isLoading ? <SpinnerComponent /> : <>Đăng nhập</>}
            </button>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                margin: "10px 0",
              }}
            >
              <Link to={"/forgotPassword"} style={{ textDecoration: "none" }}>
                <TextComponent text="Quên mật khẩu ?" size={sizes.bigText} />
              </Link>
              <SpaceComponent height={6} />
              <Link to={"/register"} style={{ textDecoration: "none" }}>
                <TextComponent
                  text="Đăng ký tài khoản mới"
                  size={sizes.bigText}
                />
              </Link>
            </div>
          </RowComponent>
        </RowComponent>

        {/* ben phai */}
        <RowComponent
          styles={{
            height: "100%",
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            borderRadius: 10,
          }}
        >
          <img
            src="https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2020/6/11/811760/Lion-2.jpg"
            alt=""
            style={{
              borderRadius: 10,
              objectFit: "cover",
              height: "100%",
              width: "100%",
            }}
          />
        </RowComponent>
      </RowComponent>

      {/* <ModalResetPassword /> */}
    </SectionComponent>
  );
}
