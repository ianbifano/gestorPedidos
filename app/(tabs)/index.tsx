import { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../constants/supabase';

export default function CreateUserScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createUser = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    const { error } = await supabase.from('users').insert([
      {
        username,
        email,
        password,
        blocked: 0,
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    router.push('../users');
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Username" onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Email" onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={styles.input} />
      <Button title="Crear Usuario" onPress={createUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 10 }
});