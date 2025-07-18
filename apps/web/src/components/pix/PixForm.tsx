import { Search, AccountBalance } from "@mui/icons-material";
import {
  Box,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  StyledButton,
  StyledTextField,
} from "@woovi-playground/ui";
import { FormTitle } from "../form/FormTitle";

interface PixFormProps {
  pixKey: string;
  value: string;
  onPixKeyChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const PixForm = ({
  pixKey,
  value,
  onPixKeyChange,
  onValueChange,
  onSubmit,
  isLoading,
}: PixFormProps) => {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
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
      <FormTitle
        title="Consultar Chave PIX"
        subtitle="Digite a chave PIX e o valor para simular uma transação"
      />

      <StyledTextField
        label="Chave PIX"
        placeholder="E-mail, telefone, CPF ou chave aleatória"
        fullWidth
        value={pixKey}
        onChange={(e) => onPixKeyChange(e.target.value)}
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
        onChange={(e) => onValueChange(e.target.value)}
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
        disabled={!pixKey || !value || isLoading}
      >
        {isLoading ? (
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
    </Box>
  );
};
