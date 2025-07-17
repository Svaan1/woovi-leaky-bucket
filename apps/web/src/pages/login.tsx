import { useState } from "react";
import { graphql } from "relay-runtime";
import { useMutation } from "react-relay";
import { parseError } from "../relay/utils";
import { setCookie } from "nookies";
import Router from "next/router";
import { Fade } from "@mui/material";

import { AppLogo, AuthForm, AuthFooter, AuthSuccess } from "../components";
import { StyledContainer } from "@woovi-playground/ui";

import { loginMutation as LoginMutationType } from "../__generated__/loginMutation.graphql";

const Login = () => {
  const LoginMutation = graphql`
    mutation loginMutation($email: String!, $password: String!) {
      UserLogin(input: { email: $email, password: $password }) {
        token
      }
    }
  `;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [commitMutation, isMutationInFlight] =
    useMutation<LoginMutationType>(LoginMutation);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    commitMutation({
      variables: {
        email: email,
        password: password,
      },

      onCompleted: (response, errors) => {
        setError(null);

        if (errors) {
          const errorMessage = errors.map((e) => e.message).join(", ");
          setError(errorMessage);
          return;
        }

        if (response.UserLogin?.token) {
          setCookie(undefined, "woovi.token", response.UserLogin.token, {
            maxAge: 60 * 60 * 1,
          });
          
          setSuccess(true);
          
          // Delay before redirecting
          setTimeout(() => {
            setRedirecting(true);
            setTimeout(() => Router.push("/"), 250);
          }, 500);
        }
      },

      onError: (error) => {
        setError(parseError(error));
      },
    });
  }

  return (
    <Fade in={!redirecting} timeout={250}>
      <StyledContainer>
        <AppLogo />
        
        {success ? (
          <AuthSuccess message="Login realizado com sucesso! Redirecionando..." />
        ) : (
          <AuthForm
            title="Login"
            email={email}
            password={password}
            isEmailValid={isEmailValid}
            error={error}
            isLoading={isMutationInFlight}
            buttonText={isMutationInFlight ? "Autenticando..." : "Continuar"}
            onSubmit={handleSubmit}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onEmailValidChange={setIsEmailValid}
          />
        )}
        
        {!success && (
          <AuthFooter
            text="Novo na Woovi?"
            linkText="Clique aqui pra se cadastrar"
            linkHref="/register"
          />
        )}
      </StyledContainer>
    </Fade>
  );
};

export default Login;
