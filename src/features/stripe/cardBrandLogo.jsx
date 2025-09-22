import CreditCardIcon from "@mui/icons-material/CreditCard";

export const cardBrandLogo = (brand) => {
  switch (brand) {
    case "visa":
      return <img src="/card-logos/visa.svg" alt="Visa" style={{ height: 24, marginRight: 12 }} />;
    case "mastercard":
      return <img src="/card-logos/mastercard.svg" alt="Mastercard" style={{ height: 24, marginRight: 12 }} />;
    case "amex":
      return <img src="/card-logos/amex.svg" alt="Amex" style={{ height: 24, marginRight: 12 }} />;
    default:
      return <CreditCardIcon fontSize="small" style={{ height: 24, marginRight: 12 }} />;
  }
};
