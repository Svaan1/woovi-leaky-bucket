import { useState } from "react";
import { useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { parseError } from "../relay/utils";
import { setCookie } from "nookies";
import Router from "next/router";

import { AppLogo, AuthForm, AuthFooter } from "../components";
import { StyledContainer } from "@woovi-playground/ui";

import { registerMutation as RegisterMutationType } from "../__generated__/registerMutation.graphql";

const Register = () => {
  const RegisterMutation = graphql`
    mutation registerMutation($email: String!, $password: String!) {
      UserSignup(input: { email: $email, password: $password }) {
        token
      }
    }
  `;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [commitMutation, isMutationInFlight] =
    useMutation<RegisterMutationType>(RegisterMutation);

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

        if (response.UserSignup?.token) {
          setCookie(undefined, "woovi.token", response.UserSignup.token, {
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
        title="Crie sua Conta"
        subtitle="Cadastre-se rapidamente e comece a vender mais"
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
        text="Já tem uma conta?"
        linkText="Clique aqui para fazer login"
        linkHref="/login"
      />
    </StyledContainer>
  );
};

export default Register;
