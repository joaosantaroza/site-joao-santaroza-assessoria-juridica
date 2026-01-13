-- Criar bucket para cache de áudio TTS
INSERT INTO storage.buckets (id, name, public)
VALUES ('tts-cache', 'tts-cache', true);

-- Política de leitura pública (qualquer um pode ouvir)
CREATE POLICY "Acesso público de leitura ao cache TTS"
ON storage.objects FOR SELECT
USING (bucket_id = 'tts-cache');

-- Política de escrita apenas para service role (Edge Function)
CREATE POLICY "Service role pode criar cache TTS"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tts-cache');