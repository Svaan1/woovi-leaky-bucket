import { useState } from "react";
import { graphql } from "relay-runtime";
import { useMutation } from "react-relay";
import { parseError } from "../relay/utils";
import { setCookie } from "nookies";
import Router from "next/router";

import { AppLogo, AuthForm, AuthFooter } from "../components";
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
          Router.push("/");
        }
      },

      onError: (error) => {
        setError(parseError(error));
      },
    });
  }

  return (
    <StyledContainer>
      <AppLogo />
      
      <AuthForm
        title="Login"
        email={email}
        password={password}
        isEmailValid={isEmailValid}
        error={error}
        isLoading={isMutationInFlight}
        buttonText="Continuar"
        onSubmit={handleSubmit}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onEmailValidChange={setIsEmailValid}
      />
      
      <AuthFooter
        text="Novo na Woovi?"
        linkText="Clique aqui pra se cadastrar"
        linkHref="/register"
      />
    </StyledContainer>
  );
};

export default Login;
