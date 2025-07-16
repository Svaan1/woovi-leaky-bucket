import { useState } from "react";
import { graphql } from "relay-runtime";
import { useMutation } from "react-relay";
import { destroyCookie } from "nookies";
import Router from "next/router";

import {
  Search,
  AccountBalance,
  CheckCircle,
  ErrorOutline,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Alert,
  Fade,
  CircularProgress,
  Typography,
} from "@mui/material";

import { Header, PageTitle } from "../components";
import {
  StyledButton,
  StyledContainer,
  StyledTextField,
} from "@woovi-playground/ui";

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

  const handleLogout = () => {
    destroyCookie(undefined, "woovi.token", {
      path: "/",
    });
    Router.push("/login");
  };

  return (
    <StyledContainer>
      <Header />

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          width: "100%",
          maxWidth: "600px",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: 2,
          p: 4,
        }}
      >
        <PageTitle
          title="Consultar Chave PIX"
          subtitle="Digite a chave PIX e o valor para simular uma transação"
        />

        <StyledTextField
          label="Chave PIX"
          placeholder="E-mail, telefone, CPF ou chave aleatória"
          fullWidth
          value={pixKey}
          onChange={(e) => setPixKey(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountBalance color="action" />
              </InputAdornment>
            ),
          }}
          required
        />

        <StyledTextField
          label="Valor"
          type="number"
          placeholder="0,00"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">R$</InputAdornment>
            ),
          }}
          inputProps={{
            step: "0.01",
            min: "0.01",
          }}
          required
        />

        <StyledButton
          variant="contained"
          fullWidth
          type="submit"
          disabled={!pixKey || !value || isMutationInFlight}
        >
          {isMutationInFlight ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
              Consultando...
            </>
          ) : (
            <>
              <Search sx={{ mr: 1 }} />
              Consultar PIX
            </>
          )}
        </StyledButton>

        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mt: 2 }} icon={<ErrorOutline />}>
              {error}
            </Alert>
          </Fade>
        )}

        {result && (
          <Fade in>
            <Card
              sx={{
                mt: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  bgcolor: "rgba(3, 214, 157, 0.1)",
                }}
              >
                <CheckCircle sx={{ color: "rgb(3, 214, 157)" }} />
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "Nunito, sans-serif", fontWeight: 600 }}
                >
                  Chave PIX Encontrada
                </Typography>
                <Chip
                  icon={<AccountBalance />}
                  label="Chave Aleatória"
                  size="small"
                  sx={{
                    bgcolor: "rgb(3, 214, 157)",
                    color: "white",
                    "& .MuiChip-icon": {
                      color: "white",
                    },
                  }}
                />
              </Box>

              <CardContent sx={{ p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    mt: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    <strong>Destinatário:</strong> {result.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Banco:</strong> {result.bank}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Box>

      <Button
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
      </Button>
    </StyledContainer>
  );
};

export default Index;
