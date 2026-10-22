import { ImageSourcePropType } from "react-native";
import React from "react";

export type FormVariant = "normal" | "password" | "dropdown" | "date";

export interface DropdownOption {
  label: string;
  value: string;
  image?: ImageSourcePropType;
}

export interface IFormProps {
  keyboardType?: "numeric" | "default" | "email-address";
  placeholder: string;
  text?: string;
  variant?: FormVariant;
  value: string;
  editable?: boolean;
  options?: DropdownOption[];
  onSelect?: (value: string) => void;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  leftIcon?: React.ReactNode;
  dateTimeMode?: "date" | "time";
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyOptionsMessage?: string;
  multiline?: boolean;
  numberOfLines?: number;
}

