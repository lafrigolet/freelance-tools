import React, { useMemo, useRef, useState, useEffect } from 'react';

import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ListSubheader,
  TextField,
  InputAdornment,
  Box
} from '@mui/material';
import Flag from 'react-world-flags';


const digitsOnly = (s) => (s || '').replace(/\D/g, '');

const formatByPattern = (digits, groups) => {
  let res = [];
  let i = 0;
  groups.forEach((g) => {
    if (i >= digits.length) return;
    res.push(digits.slice(i, i + g));
    i += g;
  });
  while (i < digits.length) {
    res.push(digits.slice(i, i + 3));
    i += 3;
  }
  return res.filter(Boolean).join(' ');
};

const formatForCountry = (digits, cc) => {
  const rule = COUNTRIES.find((c) => c.code === cc);
  if (!rule) return formatByPattern(digits, [3, 3, 3, 3]);
  const trimmed = digits.slice(0, rule.len);
  return formatByPattern(trimmed, rule.pattern);
};

function CountrySelect({
  value,
  onChange,
  disabled = false,
  size = 'small',
  margin = 'dense',
  label = 'Country',
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().replace(/\s+/g, '');
    return COUNTRIES.filter(
      (c) =>
        c.country.toLowerCase().includes(s) ||
        c.code.replace(/\s+/g, '').includes(s)
    );
  }, [q]);

  const selected = COUNTRIES.find((c) => c.code === value);

  return (
    <FormControl fullWidth variant="outlined" size={size} margin={margin}>
      <InputLabel>{label}</InputLabel>
      <Select
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => {
          setOpen(false);
          setQ('');
        }}
        value={value}
        label={label}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(false);
          setQ('');
        }}
        disabled={disabled}
        renderValue={(code) => {
          const c = COUNTRIES.find((x) => x.code === code);
          if (!c) return '';
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Flag code={c.flag} style={{ width: 20 }} />
              <strong>{c.country}</strong>
              <span style={{ color: '#666' }}>{c.code}</span>
            </Box>
          );
        }}
        MenuProps={{
          PaperProps: { style: { maxHeight: 360, width: 300 } },
        }}
      >
        <ListSubheader disableSticky sx={{ p: 1 }}>
          <TextField
            inputRef={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: US / +1"
            size="small"
            fullWidth
            onKeyDown={(e) => e.stopPropagation()}
          />
        </ListSubheader>

        {filtered.length === 0 && (
          <MenuItem disabled>No matches</MenuItem>
        )}

        {filtered.map((option) => (
          <MenuItem key={option.code} value={option.code}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Flag code={option.flag} style={{ width: 20 }} />
              <strong>{option.country}</strong>
              <span style={{ color: '#666' }}>{option.code}</span>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function PhoneNumberInput({
  initialCountryCode = '+34',
  value = '',
  onChange,
  disabled = false,
  size = 'small',
  margin = 'dense',
}) {
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [formatted, setFormatted] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const d = digitsOnly(value);
    const f = formatForCountry(d, countryCode);
    setFormatted(f);
    validateAndEmit(countryCode, d, f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateAndEmit = (cc, d, f) => {
    const rule = COUNTRIES.find((c) => c.code === cc);
    const exp = rule?.len;
    const isValid = exp ? d.length === exp : d.length >= 6;
    setError(
      isValid
        ? null
        : exp === 10
        ? 'Enter a 10-digit number (e.g., 555 123 4567)'
        : exp
        ? `Enter a ${exp}-digit number`
        : 'Enter a valid number'
    );
    onChange?.({ countryCode: cc, digits: d, formatted: f, isValid });
  };

  const handlePhoneChange = (e) => {
    const d = digitsOnly(e.target.value);
    const f = formatForCountry(d, countryCode);
    setFormatted(f);
    const rule = COUNTRIES.find((c) => c.code === countryCode);
    const isValid = rule ? d.length === rule.len : d.length >= 6;
    setError(
      isValid
        ? null
        : `Enter a ${rule?.len || 'valid'}-digit number`
    );
    onChange?.({ countryCode, digits: d, formatted: f, isValid });
  };

  const handleCountryChange = (event, option) => {
    if (!option) return;
    setCountryCode(option.code);
    const d = digitsOnly(formatted);
    const f = formatForCountry(d, option.code);
    setFormatted(f);
    validateAndEmit(option.code, d, f);
  };

  const hint = COUNTRIES.find((c) => c.code === countryCode)?.hint;

  return (
    <Grid container spacing={1} alignItems="flex-start">

      <Grid item xs={6} sm={5}>
        <CountrySelect
          value={countryCode}
          onChange={(newCode) => {
            setCountryCode(newCode);
            const d = digitsOnly(formatted);
            const f = formatForCountry(d, newCode);
            setFormatted(f);
            validateAndEmit(newCode, d, f);
          }}
        />
      </Grid>

      <Grid item xs>
        <TextField
          margin={margin}
          label="Phone Number"
          type="tel"
          fullWidth
          variant="outlined"
          value={formatted}
          onChange={handlePhoneChange}
          disabled={disabled}
          error={!!error}
          helperText={error || hint || ''}
          size={size}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{countryCode}</InputAdornment>
            ),
            inputMode: 'numeric',
          }}
        />
      </Grid>
    </Grid>
  );
}

const COUNTRIES = [
  {
    code: '+1',
    country: 'US',
    flag: 'US',
    len: 10,
    pattern: [3, 3, 4],
    hint: 'Format: xxx xxx xxxx',
  },
  {
    code: '+44',
    country: 'UK',
    flag: 'GB',
    len: 10,
    pattern: [4, 3, 3],
    hint: 'Format: xxxx xxx xxx',
  },
  {
    code: '+34',
    country: 'ES',
    flag: 'ES',
    len: 9,
    pattern: [3, 3, 3],
    hint: 'Format: xxx xxx xxx',
  },
  {
    code: '+49',
    country: 'DE',
    flag: 'DE',
    len: 10,
    pattern: [3, 3, 4],
    hint: 'Usually 10 digits',
  },
  {
    code: '+33',
    country: 'FR',
    flag: 'FR',
    len: 9,
    pattern: [3, 3, 3],
    hint: 'Format: xxx xxx xxx',
  },
  {
    code: '+39',
    country: 'IT',
    flag: 'IT',
    len: 10,
    pattern: [3, 3, 4],
    hint: 'Format: xxx xxx xxxx',
  },
  {
    code: '+81',
    country: 'JP',
    flag: 'JP',
    len: 10,
    pattern: [2, 4, 4],
    hint: 'Format: xx xxxx xxxx',
  },
  {
    code: '+86',
    country: 'CN',
    flag: 'CN',
    len: 11,
    pattern: [3, 4, 4],
    hint: 'Format: xxx xxxx xxxx',
  },
  {
    code: '+91',
    country: 'IN',
    flag: 'IN',
    len: 10,
    pattern: [5, 5],
    hint: 'Format: xxxxx xxxxx',
  },
  {
    code: '+55',
    country: 'BR',
    flag: 'BR',
    len: 11,
    pattern: [2, 5, 4],
    hint: 'Format: xx xxxxx xxxx',
  },
  {
    code: '+61',
    country: 'AU',
    flag: 'AU',
    len: 9,
    pattern: [4, 3, 2],
    hint: 'Format: xxxx xxx xx',
  },
  {
    code: '+7',
    country: 'RU',
    flag: 'RU',
    len: 10,
    pattern: [3, 3, 4],
    hint: 'Format: xxx xxx xxxx',
  },
  {
    code: '+52',
    country: 'MX',
    flag: 'MX',
    len: 10,
    pattern: [2, 4, 4],
    hint: 'Format: xx xxxx xxxx',
  },
  {
    code: '+27',
    country: 'ZA',
    flag: 'ZA',
    len: 9,
    pattern: [3, 3, 3],
    hint: 'Format: xxx xxx xxx',
  },
  {
    code: '+234',
    country: 'NG',
    flag: 'NG',
    len: 10,
    pattern: [3, 3, 4],
    hint: 'Format: xxx xxx xxxx',
  },
];
