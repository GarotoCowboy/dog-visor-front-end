import React from "react";
import {
  DatePickerField,
  DogPickerField,
  DropdownSelect,
  IFormProps,
  TextInputField,
} from "./form";

export type { DropdownOption, FormVariant, IFormProps, DogPickerFieldProps } from "./form";
export { DatePickerField, DogPickerField, DropdownSelect, TextInputField } from "./form";

export const FormComponent = (props: IFormProps) => {
  const { variant = "normal" } = props;

  if (variant === "dropdown") {
    return (
      <DropdownSelect
        text={props.text}
        placeholder={props.placeholder}
        value={props.value}
        options={props.options}
        onSelect={props.onSelect}
        searchable={props.searchable}
        searchPlaceholder={props.searchPlaceholder}
        emptyOptionsMessage={props.emptyOptionsMessage}
        editable={props.editable}
      />
    );
  }

  if (variant === "date") {
    return (
      <DatePickerField
        text={props.text}
        placeholder={props.placeholder}
        value={props.value}
        editable={props.editable}
        onChangeText={props.onChangeText}
        dateTimeMode={props.dateTimeMode}
      />
    );
  }

  return (
    <TextInputField
      keyboardType={props.keyboardType}
      placeholder={props.placeholder}
      text={props.text}
      value={props.value}
      editable={props.editable}
      onChangeText={props.onChangeText}
      onFocus={props.onFocus}
      leftIcon={props.leftIcon}
      multiline={props.multiline}
      numberOfLines={props.numberOfLines}
      variant={variant}
    />
  );
};

export default FormComponent;
