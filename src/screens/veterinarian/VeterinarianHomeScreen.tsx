
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { DogsScreen } from '../shared/DogsScreen'
import { Card } from '../../shared/components/CardComponent'
import { Button } from '../../shared/components/ButtonComponent'
import {NavigationProp, useNavigation} from '@react-navigation/native'
import { SCREENS } from '../../consts/screens'
import { VeterinarianTabs, RootStackParamList } from '../../routes'



const VeterinarianHomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();


  const handleToEventScreen= () => {
    navigation.navigate(SCREENS.EVENT_TYPE)
  }

  return (
    <View>
      <Card>
        <View>
          <Button text='Agendar Procedimento' onPress={handleToEventScreen}/>
          <Button text='Designar Filhotes' onPress={()=> {}}/>
          <Button text='Gestão da Alimentação dos Cães' onPress={()=> {}}/>


        </View>
      </Card>
    </View>
  )
}

export default VeterinarianHomeScreen

const styles = StyleSheet.create({})