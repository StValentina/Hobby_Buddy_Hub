CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    receiver_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE,
    CONSTRAINT different_users CHECK (requester_id != receiver_id),
    UNIQUE (requester_id, receiver_id)
);

CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_receiver_id ON connections(receiver_id);
CREATE INDEX idx_connections_status ON connections(status);

ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections"
    ON connections FOR SELECT
    USING (requester_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can create connection requests"
    ON connections FOR INSERT
    WITH CHECK (requester_id = auth.uid());

CREATE POLICY "Users can update received connection requests"
    ON connections FOR UPDATE
    USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());

CREATE POLICY "Users can delete their own connections"
    ON connections FOR DELETE
    USING (requester_id = auth.uid() OR receiver_id = auth.uid());