import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RowComponent,
  SectionComponent,
  SpaceComponent,
  SpinnerComponent,
  TextComponent,
} from "../../components";
import { colors } from "../../constants/colors";
import { handleToastSuccess } from "../../constants/handleToast";
import { sizes } from "../../constants/sizes";
import { validateEmail } from "../../constants/validateEmailPhone";
import { auth } from "../../firebase.config";
import { setDocData } from "../../constants/firebase/setDocData";
import { serverTimestamp } from "firebase/firestore";

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [disable, setDisable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (
      form.name &&
      form.email &&
      validateEmail(form.email) &&
      form.password &&
      form.password.length >= 6 &&
      form.confirmPassword &&
      form.confirmPassword.length >= 6 &&
      form.password === form.confirmPassword
    ) {
      setDisable(false);
    } else {
      setDisable(true);
    }
  }, [form]);

  const handleRegister = async () => {
    setIsLoading(true);
    await createUserWithEmailAndPassword(auth, form.email, form.password)
      .then(async (userCredential) => {
        // cập nhật displayName
        await updateProfile(userCredential.user, {
          displayName: form.name,
        });
        // sign out để user không bị đăng nhập
        await signOut(auth);
        // Signed in
        setIsLoading(false);
        const { user } = userCredential;
        setDocData({
          nameCollect: "users",
          id: user.uid,
          valueUpdate: {
            id: user.uid,
            email: form.email,
            fullName: form.name,
            shortName: form.name,
            avatar: "",
            phone: "",
            birth: serverTimestamp(),
            role: "member",
            position:'member',

            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
        });
        handleToastSuccess(
          "Đăng ký tài khoản thành công, bạn hãy liên hệ admin để cấp quyền !",
        );
        navigate("/login");
      })
      .catch((error: any) => {
        console.log(error);
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
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {/* ben trái */}
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
            src="https://genk.mediacdn.vn/ExCmsGenK/1031801/2014/06/img_201406172229517415.jpg"
            alt=""
            style={{
              borderRadius: 10,
              objectFit: "cover",
              height: "100%",
              width: "100%",
            }}
          />
        </RowComponent>

        {/* ben phải */}
        <RowComponent
          styles={{
            height: "100%",
            width: "100%",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingLeft: 32,
          }}
        >
          <RowComponent
            styles={{
              display: "flex",
              flexDirection: "column",
              background: colors.bacground,
              padding: 30,
              borderRadius: 10,
              height: "100%",
              width: "50%",
            }}
          >
            <TextComponent
              text="Đăng ký"
              size={sizes.title}
              styles={{ fontWeight: "bold" }}
            />
            <SpaceComponent height={20} />
            <div style={{ width: "100%" }}>
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Họ và tên
              </label>
              <input
                onChange={(val) =>
                  setForm({
                    ...form,
                    name: val.target.value,
                  })
                }
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
            <SpaceComponent height={10} />
            <div style={{ width: "100%" }}>
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Email
              </label>
              <input
                onChange={(val) =>
                  setForm({
                    ...form,
                    email: val.target.value,
                  })
                }
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
            <SpaceComponent height={10} />
            <div style={{ width: "100%" }}>
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Mật khẩu
              </label>
              <input
                type="password"
                onChange={(val) =>
                  setForm({
                    ...form,
                    password: val.target.value,
                  })
                }
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
            <SpaceComponent height={10} />
            <div style={{ width: "100%" }}>
              <label htmlFor="exampleFormControlInput1" className="form-label">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                onChange={(val) =>
                  setForm({
                    ...form,
                    confirmPassword: val.target.value,
                  })
                }
                className="form-control"
                id="exampleFormControlInput1"
              />
            </div>
            <SpaceComponent height={20} />

            <button
              style={{
                width: "100%",
                background: disable ? colors.gray : colors.orange,
                borderColor: disable ? colors.gray : colors.orange,
                fontWeight: "bold",
              }}
              type="button"
              className="btn btn-primary"
              onClick={disable ? undefined : handleRegister}
            >
              {isLoading ? <SpinnerComponent /> : <>Đăng ký</>}
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
              <Link to={"/login"} style={{ textDecoration: "none" }}>
                <TextComponent text="Đăng nhập" size={sizes.bigText} />
              </Link>
            </div>
          </RowComponent>
        </RowComponent>
      </RowComponent>
    </SectionComponent>
  );
}
