import {
  AccountBalance,
  CheckCircle,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Fade,
  Typography,
} from "@mui/material";

interface PixResultProps {
  result: {
    name: string;
    bank: string;
  };
}

export const PixResult = ({ result }: PixResultProps) => {
  return (
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
  );
};
