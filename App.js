import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

import {
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

import { AcessibilidadeProvider } from './src/contexto/Acessibilidade';
import { lerUsuario } from './src/servicos/armazenamento';
import {
  pedirPermissao,
  configurarCanalAndroid,
} from './src/servicos/notificacoes';

import BemVindo from './src/telas/BemVindo';
import Principal from './src/telas/Principal';
import Medicamentos from './src/telas/Medicamentos';
import CadastrarMedicamento from './src/telas/CadastrarMedicamento';
import RegistrarSintoma from './src/telas/RegistrarSintoma';
import SOS from './src/telas/SOS';
import CadastrarContato from './src/telas/CadastrarContato';
import Historico from './src/telas/Historico';
import Acessibilidade from './src/telas/Acessibilidade';
import MedirTremor from './src/telas/MedirTremor';

import { cores, fontes } from './src/estilos/tema';

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsCarregadas] = useFonts({
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
});

  const [checandoUsuario, setChecandoUsuario] = useState(true);
  const [temUsuario, setTemUsuario] = useState(false);

  // Descobre se já existe usuário salvo
  useEffect(() => {
    (async () => {
      const u = await lerUsuario();
      setTemUsuario(!!u);
      setChecandoUsuario(false);
    })();
  }, []);
    // Configura notificações na primeira abertura
  useEffect(() => {
    (async () => {
      await configurarCanalAndroid();
      await pedirPermissao();
    })();
  }, []);

  const onLayout = useCallback(async () => {
    if (fontsCarregadas && !checandoUsuario) {
      await SplashScreen.hideAsync();
    }
  }, [fontsCarregadas, checandoUsuario]);

  if (!fontsCarregadas || checandoUsuario) return null;

  return (
    <AcessibilidadeProvider>
      <View style={{ flex: 1, backgroundColor: cores.papel }} onLayout={onLayout}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName={temUsuario ? 'Principal' : 'BemVindo'}
            screenOptions={{
              headerStyle: { backgroundColor: cores.papel },
              headerShadowVisible: false,
              headerTintColor: cores.ink,
              headerTitleStyle: {
                fontFamily: fontes.bold,
                fontSize: 19,
                color: cores.ink,
              },
              headerTitleAlign: 'center',
              headerBackTitle: 'Voltar',
            }}
          >
            <Stack.Screen
              name="BemVindo"
              component={BemVindo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Principal"
              component={Principal}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Medicamentos" component={Medicamentos} options={{ title: '' }} />
            <Stack.Screen name="CadastrarMedicamento" component={CadastrarMedicamento} options={{ title: '' }} />
            <Stack.Screen name="RegistrarSintoma" component={RegistrarSintoma} options={{ title: '' }} />
            <Stack.Screen name="SOS" component={SOS} options={{ title: '' }} />
            <Stack.Screen name="CadastrarContato" component={CadastrarContato} options={{ title: '' }} />
            <Stack.Screen name="Historico" component={Historico} options={{ title: '' }} />
            <Stack.Screen name="Acessibilidade" component={Acessibilidade} options={{ title: '' }} />
           <Stack.Screen name="MedirTremor" component={MedirTremor} options={{ title: '' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </AcessibilidadeProvider>
  );
}