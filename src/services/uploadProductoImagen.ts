import { supabase } from '@/constants/supabase';

export const uploadProductoImagen = async (uri: string) => {
  const fileName = `${Date.now()}.jpg`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('productos')
    .upload(fileName, blob, {
      contentType: 'image/jpeg',
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from('productos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};