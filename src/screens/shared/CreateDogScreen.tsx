import { View, Text, StyleSheet } from "react-native";
import { Card } from "../../shared/components/CardComponent";
import FormComponent from "../../shared/components/FormComponent";
import { useState } from "react";
import { EDOG_RACE, ICreateDogRequest } from "../../types/Dog";
import { CheckBox } from "../../shared/components/CheckBoxComponent";

export const CreateDogsScreen = () => {
  const [sex, setSex] = useState<"M" | "F" | null>(null);
  const [formData, setFormData] = useState<ICreateDogRequest>({
    name: "",
    race: null,
    dateOfBirth: null,
    sex: "",
    status: null,
  });

  return (
    <View>
      <Card>
        <View>
          <Text> Identificação</Text>

          <FormComponent
            text="Nome:"
            placeholder="Thor"
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
          />
          <FormComponent
            variant="dropdown"
            editable={false}
            text="Raça:"
            placeholder="Selecione a Raça"
            value={formData.race ? String(formData.race) : ""}
            onChangeText={() => {}}
            options={[
              { label: "Labrador", value: EDOG_RACE.LABRADOR },
              { label: "Border Collier", value: EDOG_RACE.BORDER_COLLIER },
              { label: "Golden Retriever", value: EDOG_RACE.GOLDEN_RETRIEVER },
              { label: "Pastor Alemão", value: EDOG_RACE.PASTOR_ALEMAO },
            ]}
            onSelect={(val) =>
              setFormData((prev) => ({ ...prev, race: val as EDOG_RACE }))
            }
          />
        
        <View style={{flexDirection:"row", gap: 22}}>
            <CheckBox
            value={sex === "M"}
            // Se clicar, define o gênero como 'M'
            onChangeChecked={() => setSex("M")}
            label="Masculino"
          />

          <CheckBox
            value={sex === "F"}
            // Se clicar, define o gênero como 'F'
            onChangeChecked={() => setSex("F")}
            label="Feminino"
          />
        </View>
          
          <FormComponent
            text="Nome:"
            placeholder="Thor"
            value={formData.name}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, name: text }))
            }
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({});
