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
    mutation registerMutation($name: String!, $email: String!, $password: String!) {
      UserSignup(input: { name: $name, email: $email, password: $password }) {
        token
      }
    }
  `;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [commitMutation, isMutationInFlight] =
    useMutation<RegisterMutationType>(RegisterMutation);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    commitMutation({
      variables: {
        name: name,
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
        name={name}
        email={email}
        password={password}
        isNameValid={isNameValid}
        isEmailValid={isEmailValid}
        isPasswordValid={isPasswordValid}
        error={error}
        isLoading={isMutationInFlight}
        buttonText="Continuar"
        onSubmit={handleSubmit}
        onNameChange={setName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onNameValidChange={setIsNameValid}
        onEmailValidChange={setIsEmailValid}
        onPasswordValidChange={setIsPasswordValid}
        showNameField={true}
        showPasswordValidation={true}
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
