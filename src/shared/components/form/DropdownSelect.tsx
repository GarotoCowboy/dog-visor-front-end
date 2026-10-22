import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { theme } from "../../../../theme/theme";
import { DropdownOption, IFormProps } from "./types";

export type DropdownSelectProps = Pick<
  IFormProps,
  | "text"
  | "placeholder"
  | "value"
  | "options"
  | "onSelect"
  | "searchable"
  | "searchPlaceholder"
  | "emptyOptionsMessage"
  | "editable"
>;

export const DropdownSelect = ({
  text,
  placeholder,
  value,
  options,
  onSelect,
  searchable = false,
  searchPlaceholder = "Pesquisar",
  emptyOptionsMessage = "Nenhuma opcao encontrada",
  editable = true,
}: DropdownSelectProps) => {
  const dropdownRef = useRef<View>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [dropdownPosition, setDropdownPosition] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const borderColorActive = isFocused
    ? theme.colors.primary
    : theme.colors.border;

  const closeDropdown = () => {
    setIsOpen(false);
    setIsFocused(false);
    setDropdownSearch("");
  };

  const openDropdown = () => {
    if (editable === false) return;
    if (isOpen) {
      closeDropdown();
      return;
    }

    dropdownRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({ x, y, width, height });
      setIsFocused(true);
      setIsOpen(true);
    });
  };

  const normalizedDropdownSearch = dropdownSearch.toLowerCase().trim();
  const filteredOptions =
    options?.filter((opt) =>
      normalizedDropdownSearch
        ? opt.label.toLowerCase().includes(normalizedDropdownSearch)
        : true,
    ) ?? [];

  const windowDimensions = Dimensions.get("window");
  const windowHeight = windowDimensions.height;
  const windowWidth = windowDimensions.width;

  const ITEM_HEIGHT = 44;
  const PADDING = 16;
  const estimatedListHeight = Math.min(
    (filteredOptions?.length || 1) * ITEM_HEIGHT +
      PADDING +
      (searchable ? 50 : 0),
    220,
  );

  const spaceBelow =
    windowHeight - (dropdownPosition.y + dropdownPosition.height);
  const shouldOpenUpwards =
    spaceBelow < estimatedListHeight + 30 &&
    dropdownPosition.y > estimatedListHeight;

  const dropdownTop = shouldOpenUpwards
    ? Math.max(10, dropdownPosition.y - estimatedListHeight - 4)
    : dropdownPosition.y + dropdownPosition.height + 4;

  const dropdownMaxHeight = shouldOpenUpwards
    ? Math.min(220, Math.max(80, dropdownPosition.y - 20))
    : Math.min(220, Math.max(80, windowHeight - dropdownTop - 20));

  const dropdownLeft = Math.max(
    10,
    Math.min(dropdownPosition.x, windowWidth - dropdownPosition.width - 10),
  );

  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      {text ? <Text style={styles.formText}>{text}</Text> : null}

      <View ref={dropdownRef} style={styles.dropdownWrapper}>
        <Pressable onPress={openDropdown} disabled={editable === false}>
          <View pointerEvents="none">
            <TextInput
              style={[
                styles.formContainer,
                { borderColor: borderColorActive },
              ]}
              value={value}
              placeholder={placeholder}
              editable={false}
            />
          </View>
        </Pressable>

        <Modal
          transparent
          visible={isOpen}
          animationType="none"
          onRequestClose={closeDropdown}
        >
          <View style={styles.modalContainer}>
            <Pressable style={styles.modalBackdrop} onPress={closeDropdown} />
            <View
              style={[
                styles.dropdownList,
                {
                  borderColor: borderColorActive,
                  left: dropdownLeft,
                  top: dropdownTop,
                  width: dropdownPosition.width,
                  maxHeight: dropdownMaxHeight,
                },
              ]}
            >
              {searchable ? (
                <TextInput
                  style={styles.dropdownSearchInput}
                  value={dropdownSearch}
                  onChangeText={setDropdownSearch}
                  placeholder={searchPlaceholder}
                  autoFocus
                />
              ) : null}

              <ScrollView
                style={[
                  styles.dropdownScroll,
                  { maxHeight: dropdownMaxHeight - (searchable ? 55 : 20) },
                ]}
                keyboardShouldPersistTaps="handled"
              >
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((opt) => (
                    <Pressable
                      key={opt.value}
                      style={styles.dropdownItem}
                      onPress={() => {
                        onSelect?.(opt.value);
                        closeDropdown();
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        {opt.image ? (
                          <Image
                            source={opt.image}
                            style={styles.dropdownItemImage}
                          />
                        ) : null}
                        <Text style={styles.dropdownItemText}>{opt.label}</Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.emptyOptionsText}>
                    {emptyOptionsMessage}
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
    zIndex: 1,
  },
  containerOpen: {
    elevation: 10,
    zIndex: 1000,
  },
  formText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    borderStyle: "solid",
    borderWidth: 1,
    color: theme.colors.text,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  dropdownList: {
    position: "absolute",
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 8,
    elevation: 10,
    zIndex: 1000,
  },
  dropdownSearchInput: {
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownScroll: {
    maxHeight: 220,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dropdownItemContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  dropdownItemImage: {
    borderRadius: theme.borderRadius.full,
    height: 36,
    width: 36,
  },
  dropdownItemText: {
    color: theme.colors.text,
    flex: 1,
  },
  emptyOptionsText: {
    color: theme.colors.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});

