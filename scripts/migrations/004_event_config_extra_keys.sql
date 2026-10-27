-- Extends the existing event_config key/value table with feature flags, org/content
-- strings, and manually-entered stats, so year-to-year changes are admin edits,
-- not code edits. All values are intentionally generic placeholders -- replace
-- them from the admin dashboard's Site Settings tab.

INSERT IGNORE INTO event_config (config_key, config_value, description) VALUES
-- Feature flags: control public nav + page availability without touching code.
('feature_registration_enabled', 'false', 'Show Register nav link and allow new registrations'),
('feature_schedule_enabled', 'false', 'Show Schedule nav link and page'),
('feature_sponsors_enabled', 'false', 'Show Sponsors nav link and page'),
('feature_team_enabled', 'true', 'Show Team (volunteer/organisation) nav link and page'),
('feature_faq_enabled', 'false', 'Show FAQ section on the home page'),

-- Org / content strings
('org_name', 'DCTerra', 'Organisation name shown across the site'),
('org_website_url', 'https://example.org', 'Organisation website, linked from the footer'),
('org_description', 'A charity we are proud to support.', 'Short description of the supported cause'),
('event_venue', 'To be announced', 'Where the livestream takes place'),
('discord_invite_link', '', 'Discord invite link included in confirmation emails'),
('stream_platform_url', '', 'Link to the live stream (YouTube/Twitch/etc.)'),
('contact_email', 'contact@example.org', 'Public contact email address'),

-- Manually-entered stats (there is no payment integration, so these are never
-- computed automatically -- an organizer types the real number in).
('stat_funds_raised_amount', '0', 'Funds raised so far, entered manually by an organizer'),
('stat_funds_raised_mode', 'manual', 'How stat_funds_raised_amount is sourced (always manual for now)'),
('stat_funds_goal_amount', '0', 'Fundraising goal shown on the home page, entered manually by an organizer'),
('stat_expected_participants', '0', 'Expected participants figure shown on the home page, entered manually by an organizer');
