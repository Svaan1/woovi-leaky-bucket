import { StyledButton } from "@woovi-playground/ui";
import { destroyCookie } from "nookies";
import Router from "next/router";

export const LogoutButton = () => {
  const handleLogout = () => {
    destroyCookie(undefined, "woovi.token", {
      path: "/",
    });
    Router.push("/login");
  };

  return (
    <StyledButton
      variant="contained"
      color="error"
      sx={{
        marginTop: "20px",
        shadowBox: "none",
        "&:hover": {
          shadowBox: "none",
        },
      }}
      onClick={handleLogout}
    >
      Sair
    </StyledButton>
  );
};
