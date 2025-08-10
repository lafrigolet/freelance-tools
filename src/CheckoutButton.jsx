import React, { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const BankCardForm = ({ finalAmount }) => {
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiryDate: '', cvc: '' });
  const [selectedCard, setSelectedCard] = useState('');

  // Manejador para cambios en el formulario de tarjeta
  const handleCardChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  // Seleccionar tarjeta ya almacenada (simulación)
  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setCardDetails({});
  };

  const handleSubmit = () => {
    if (selectedCard) {
      // Aquí podrías realizar la lógica de pago con Bizum
      alert(`Pago realizado con Tarjeta para el número: ${cardDetails.cardNumber}`);
      setSelectedCard('Tarjeta'); // Se puede simular la selección de Bizum
    } else {
      alert('Por favor, ingrese un número de teléfono válido');
    }
  };


  return (
    <div>
      {selectedCard ? (
        <div>
          <Typography>Tarjeta seleccionada: {selectedCard}</Typography>
          <Button variant="outlined" onClick={() => setSelectedCard('')}>Cambiar tarjeta</Button>
        </div>
      ) : (
        <div>
          <Button variant="outlined" onClick={() => setSelectedCard('Card1')}>Tarjeta 1</Button>
          <Button variant="outlined" onClick={() => setSelectedCard('Card2')} sx={{ mt: 1 }}>Tarjeta 2</Button>
        </div>
      )}
      {!selectedCard && (
        <div>
          <Typography variant="body2">Añadir nueva tarjeta</Typography>
          <TextField
            label="Número de tarjeta"
            name="cardNumber"
            value={cardDetails.cardNumber}
            onChange={handleCardChange}
            fullWidth
            sx={{ mt: 1 }}
          />
          <TextField
            label="Fecha de vencimiento"
            name="expiryDate"
            value={cardDetails.expiryDate}
            onChange={handleCardChange}
            fullWidth
            sx={{ mt: 1 }}
          />
          <TextField
            label="CVC"
            name="cvc"
            value={cardDetails.cvc}
            onChange={handleCardChange}
            fullWidth
            sx={{ mt: 1 }}
          />
        </div>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
          Realizar pago - {finalAmount}€
        </Button>
      </Box>
    </div>
  );
};

const BizumForm = ({ finalAmount, setSelectedCard }) => {
  const [phoneNumber, setPhoneNumber] = useState('');

  // Manejador de cambio de número de teléfono
  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  const handleSubmit = () => {
    if (phoneNumber) {
      // Aquí podrías realizar la lógica de pago con Bizum
      alert(`Pago realizado con Bizum para el número: ${phoneNumber}`);
      setSelectedCard('Bizum'); // Se puede simular la selección de Bizum
    } else {
      alert('Por favor, ingrese un número de teléfono válido');
    }
  };

  return (
    <div>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Ingresa tu número de teléfono para realizar el pago con Bizum:
      </Typography>
      <TextField
        label="Número de teléfono"
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        fullWidth
        sx={{ mt: 1 }}
      />
      {/* Contenedor para centrar el botón */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Realizar pago - {finalAmount}€
        </Button>
      </Box>
    </div>
  );
};


const CheckoutButton = ({ totalAmount, availableMethods }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [increment, setIncrement] = useState(0);
  const [selectedCard, setSelectedCard] = useState('');
  const [expanded, setExpanded] = useState(false); // Para controlar qué Accordion está abierto

  // Lista completa de métodos de pago
  const paymentMethods = [
    { id: 'tarjeta', label: 'Tarjeta', increment: 0 },
    { id: 'bizum', label: 'Bizum', increment: 0.01 },
    { id: 'google-pay', label: 'Google Pay', increment: 0.02 },
    { id: 'apple-pay', label: 'Apple Pay', increment: 0.02 },
    { id: 'amazon-pay', label: 'Amazon Pay', increment: 0.03 }
  ];

  // Filtra los métodos de pago disponibles según el prop `availableMethods`
  const filteredMethods = paymentMethods.filter((method) => availableMethods.includes(method.id));

  // Calcula el incremento dependiendo del método de pago
  const calculateIncrement = (method) => {
    const selectedMethod = filteredMethods.find(payment => payment.id === method);
    if (selectedMethod) {
      setIncrement(selectedMethod.increment);
      setPaymentMethod(method);
    }
  };

  // Abre el popup con las opciones de pago
  const openPopup = () => {
    setShowPopup(true);
  };

  // Cierra el popup
  const closePopup = () => {
    setShowPopup(false);
  };

  // Calcular el total con el incremento
  const finalAmount = totalAmount * (1 + increment);

  // Maneja la expansión del Accordion
  const handleAccordionChange = (panel) => {
    setExpanded(expanded === panel ? false : panel); // Solo se puede expandir uno a la vez
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={openPopup}>
        Checkout
      </Button>

      <Dialog open={showPopup} onClose={closePopup} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          Pago de {finalAmount.toFixed(2)}€
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            {/* Accordion List de Métodos de Pago */}
            {filteredMethods.map((method) => {
              if (method.id === 'tarjeta') {
                return (
                  <Box key={method.id} sx={{ width: '100%', mb: 2 }}>
                    <Accordion
                      key={method.id}
                      expanded={expanded === method.id}
                      onChange={() => handleAccordionChange(method.id)}
                      sx={{ width: '100%' }} // Asegura que todos los Accordions tengan el mismo tamaño
                    >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'center' }}>
                      <Typography sx={{ width: '100%', textAlign: 'center' }}>
                        {method.label} - {(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)}€
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <BankCardForm finalAmount={(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)} />
                    </AccordionDetails>
                    </Accordion>
                  </Box>
                );
              } else if (method.id === 'bizum') {
                return (
                  <Box key={method.id} sx={{ width: '100%', mb: 2 }}>
                    <Accordion
                      key={method.id}
                      expanded={expanded === method.id}
                      onChange={() => handleAccordionChange(method.id)}
                      sx={{ width: '100%' }} // Asegura que todos los Accordions tengan el mismo tamaño
                    >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ justifyContent: 'center' }}>
                      <Typography sx={{ width: '100%', textAlign: 'center' }}>
                        {method.label} - {(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)}€
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <BizumForm finalAmount={(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)} />
                    </AccordionDetails>
                    </Accordion>
                  </Box>
                );
              } else if (method.id === 'google-pay') {
                return (
                  <Box key={method.id} sx={{ width: '100%', mb: 2 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => calculateIncrement(method.id)}
                      sx={{ backgroundColor: '#4285F4', textAlign: 'center', color: 'white' }}
                    >
                      {method.label} - {(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)}€
                    </Button>
                  </Box>
                );
              } else if (method.id === 'amazon-pay') {
                return (
                  <Box key={method.id} sx={{ width: '100%', mb: 2 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => calculateIncrement(method.id)}
                      sx={{ backgroundColor: '#4285F4', textAlign: 'center', color: 'white' }}
                    >
                      {method.label} - {(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)}€
                    </Button>
                  </Box>
                );
              } else if (method.id === 'apple-pay') {
                return (
                  <Box key={method.id} sx={{ width: '100%', mb: 2 }}>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => calculateIncrement(method.id)}
                      sx={{ backgroundColor: '#4285F4', textAlign: 'center', color: 'white' }}
                    >
                      {method.label} - {(Math.floor((totalAmount * (1 + method.increment)*100))/100).toFixed(2)}€
                    </Button>
                  </Box>
                );
              } 
                return null; // Retorna null si el método no es 'tarjeta'
            })}
          </Box>
          <Box sx={{ fontSize: 'small', mt: 2 }}>
            <Typography variant="caption" color="textSecondary">
              <small>
                * El precio final puede variar dependiendo del método de pago elegido.
              </small>
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closePopup} color="secondary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};


export default CheckoutButton;
