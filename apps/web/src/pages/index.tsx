import { useState } from "react";
import { graphql } from "relay-runtime";
import { useMutation } from "react-relay";

import { StyledContainer } from "@woovi-playground/ui";

import { AppLogo, PixForm, PixError, PixResult, LogoutButton } from "../components";

import { pagesPixMutation as PixPixMutationType } from "../__generated__/pagesPixMutation.graphql";

const Index = () => {
  const PixMutation = graphql`
    mutation pagesPixMutation($pixKey: String!, $value: Float!) {
      PixTransaction(input: { pixKey: $pixKey, value: $value }) {
        name
        bank
      }
    }
  `;

  const [pixKey, setPixKey] = useState("");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [commitMutation, isMutationInFlight] =
    useMutation<PixPixMutationType>(PixMutation);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (isMutationInFlight) {
      return;
    }

    // Simulated API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    commitMutation({
      variables: {
        pixKey: pixKey,
        value: parseFloat(value),
      },
      onCompleted: (response, errors) => {
        if (errors) {
          const errorMessage = errors.map((e) => e.message).join(", ");
          setError(errorMessage);
          return;
        }

        if (response.PixTransaction) {
          setResult(response.PixTransaction);
          console.log(response);
        }
      },
      onError: (error) => {
        const message = error.message;
        const jsonString = message.substring(message.indexOf("["));
        const errors = JSON.parse(jsonString);

        if (Array.isArray(errors) && errors.length > 0 && errors[0].message) {
          setError(errors[0].message);
        } else {
          setError("An unknown error occurred.");
        }
      },
    });
  };

  return (
    <StyledContainer>
      <AppLogo />

      <PixForm
        pixKey={pixKey}
        value={value}
        onPixKeyChange={setPixKey}
        onValueChange={setValue}
        onSubmit={handleSubmit}
        isLoading={isMutationInFlight}
      />

      {error && <PixError error={error} />}

      {result && <PixResult result={result} />}

      <LogoutButton />
    </StyledContainer>
  );
};

export default Index;
