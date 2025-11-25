-- Adicionar política para permitir inserções anônimas (webhook)
-- O webhook não tem autenticação de usuário, então precisa usar service_role

-- Remover política antiga de insert para contacts
DROP POLICY IF EXISTS "Allow authenticated users to insert contacts" ON contacts;

-- Criar nova política que permite service_role inserir contacts
CREATE POLICY "Allow service_role to insert contacts"
    ON contacts FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Criar nova política que permite authenticated users inserir contacts
CREATE POLICY "Allow authenticated users to insert contacts"
    ON contacts FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Fazer o mesmo para conversations
DROP POLICY IF EXISTS "Allow authenticated users to insert conversations" ON conversations;

CREATE POLICY "Allow service_role to insert conversations"
    ON conversations FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert conversations"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Fazer o mesmo para messages
DROP POLICY IF EXISTS "Allow authenticated users to insert messages" ON messages;

CREATE POLICY "Allow service_role to insert messages"
    ON messages FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Fazer o mesmo para message_events
DROP POLICY IF EXISTS "Allow authenticated users to insert message_events" ON message_events;

CREATE POLICY "Allow service_role to insert message_events"
    ON message_events FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert message_events"
    ON message_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Permitir service_role ler tudo
CREATE POLICY "Allow service_role to read contacts"
    ON contacts FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Allow service_role to read conversations"
    ON conversations FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Allow service_role to read messages"
    ON messages FOR SELECT
    TO service_role
    USING (true);

CREATE POLICY "Allow service_role to read agents"
    ON agents FOR SELECT
    TO service_role
    USING (true);

-- Permitir service_role atualizar
CREATE POLICY "Allow service_role to update contacts"
    ON contacts FOR UPDATE
    TO service_role
    USING (true);

CREATE POLICY "Allow service_role to update conversations"
    ON conversations FOR UPDATE
    TO service_role
    USING (true);

CREATE POLICY "Allow service_role to update messages"
    ON messages FOR UPDATE
    TO service_role
    USING (true);
