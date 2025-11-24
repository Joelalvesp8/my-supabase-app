-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE conversation_status AS ENUM ('open', 'waiting', 'closed');
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE message_type AS ENUM ('text', 'image', 'audio', 'document', 'video');
CREATE TYPE message_status AS ENUM ('pending', 'sent', 'delivered', 'read', 'error');
CREATE TYPE agent_role AS ENUM ('human', 'ai');

-- Table: contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: agents
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role agent_role NOT NULL DEFAULT 'human',
    online BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    status conversation_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    direction message_direction NOT NULL,
    type message_type NOT NULL DEFAULT 'text',
    text TEXT,
    media_url TEXT,
    api_file_url TEXT,
    status message_status DEFAULT 'pending',
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: message_events (for tracking status changes)
CREATE TABLE message_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    status message_status NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    raw_payload JSONB
);

-- Indexes for better performance
CREATE INDEX idx_contacts_number ON contacts(number);
CREATE INDEX idx_contacts_last_message_at ON contacts(last_message_at DESC);
CREATE INDEX idx_conversations_contact_id ON conversations(contact_id);
CREATE INDEX idx_conversations_assigned_agent_id ON conversations(assigned_agent_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_message_events_message_id ON message_events(message_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_events ENABLE ROW LEVEL SECURITY;

-- Policies for contacts (authenticated users can read all)
CREATE POLICY "Allow authenticated users to read contacts"
    ON contacts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert contacts"
    ON contacts FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update contacts"
    ON contacts FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for agents
CREATE POLICY "Allow authenticated users to read agents"
    ON agents FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to update their own agent profile"
    ON agents FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Policies for conversations
CREATE POLICY "Allow authenticated users to read conversations"
    ON conversations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert conversations"
    ON conversations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update conversations"
    ON conversations FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for messages
CREATE POLICY "Allow authenticated users to read messages"
    ON messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert messages"
    ON messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update messages"
    ON messages FOR UPDATE
    TO authenticated
    USING (true);

-- Policies for message_events
CREATE POLICY "Allow authenticated users to read message_events"
    ON message_events FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated users to insert message_events"
    ON message_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Function to automatically create agent profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.agents (user_id, name, role, online)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        'human',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create agent profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
