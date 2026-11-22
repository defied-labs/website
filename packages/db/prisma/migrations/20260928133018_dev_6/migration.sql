-- Intentionally empty.
-- This migration originally re-created indexes that 20260926163356_dev_5 already
-- creates (account_userId_idx, session_userId_idx, post_authorId_idx,
-- invitation_organizationId_idx, invitation_email_idx), so it always failed with
-- "Duplicate key name" on any database where dev_5 had run. The schema it
-- describes is identical to dev_5's, so there is nothing to apply.
SELECT 1;
