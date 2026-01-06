import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ReminderData } from "../components/ReminderModal";
import { countries, Country } from "../lib/countries";

interface FormState {
  formData: ReminderData;
  errors: Record<string, string>;
  selectedCountry: Country;
  phoneNumberInput: string;
}

export function useReminderForm(
  initialData: ReminderData | null | undefined,
  isOpen: boolean,
  mode: "create" | "edit"
) {
  const [state, setState] = useState<FormState>({
    formData: {
      title: "",
      message: "",
      phone: "",
      date: "",
      time: "",
      timezone: "UTC",
    },
    errors: {},
    selectedCountry: countries.find(c => c.code === "US") || countries[0],
    phoneNumberInput: "",
  });

  // Initialize form when modal opens or data changes
  useEffect(() => {
    setState(prev => ({ ...prev, errors: {} }));

    if (initialData) {
      let foundCountry = countries.find(c => c.code === "US") || countries[0];
      let number = initialData.phone;

      const sortedCountries = [...countries].sort(
        (a, b) => b.dial_code.length - a.dial_code.length
      );

      for (const country of sortedCountries) {
        if (initialData.phone.startsWith(country.dial_code)) {
          foundCountry = country;
          number = initialData.phone.substring(country.dial_code.length);
          if (number.startsWith(" ")) number = number.substring(1);
          break;
        }
      }

      setState(prev => ({
        ...prev,
        formData: {
          ...initialData,
          timezone: initialData.timezone || "Europe/London",
        },
        selectedCountry: foundCountry,
        phoneNumberInput: number,
      }));
    } else {
      const defaultCountry = countries.find(c => c.code === "US") || countries[0];
      const now = new Date();

      setState(prev => ({
        ...prev,
        formData: {
          title: "",
          message: "",
          phone: defaultCountry.dial_code,
          date: format(now, "yyyy-MM-dd"),
          time: format(now, "HH:mm"),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/London",
        },
        selectedCountry: defaultCountry,
        phoneNumberInput: "",
      }));
    }
  }, [initialData, isOpen, mode]);

  // Update phone when country or number changes
  useEffect(() => {
    if (isOpen) {
      const fullPhone = `${state.selectedCountry.dial_code} ${state.phoneNumberInput}`;
      setState(prev => ({
        ...prev,
        formData: { ...prev.formData, phone: fullPhone.trim() },
      }));

      if (state.errors.phone && state.phoneNumberInput.length > 3) {
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, phone: "" },
        }));
      }
    }
  }, [state.selectedCountry, state.phoneNumberInput, isOpen]);

  return {
    ...state,
    setFormData: (data: ReminderData) =>
      setState(prev => ({ ...prev, formData: data })),
    setErrors: (errors: Record<string, string>) =>
      setState(prev => ({ ...prev, errors })),
    setSelectedCountry: (country: Country) =>
      setState(prev => ({ ...prev, selectedCountry: country })),
    setPhoneNumberInput: (phone: string) =>
      setState(prev => ({ ...prev, phoneNumberInput: phone })),
  };
}

