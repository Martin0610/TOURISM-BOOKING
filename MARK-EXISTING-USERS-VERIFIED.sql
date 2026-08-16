-- Mark all existing users as email verified
-- Run this once to ensure existing users can still login after email verification feature is added

UPDATE "User" 
SET "emailVerified" = true 
WHERE "emailVerified" = false;
