"""Constants for the reminder backend."""

# List of supported IANA timezones (same as frontend)
SUPPORTED_TIMEZONES = [
    "Pacific/Midway",      # GMT-11:00
    "Pacific/Honolulu",    # GMT-10:00
    "America/Anchorage",   # GMT-09:00
    "America/Los_Angeles", # GMT-08:00
    "America/Denver",      # GMT-07:00
    "America/Chicago",     # GMT-06:00
    "America/New_York",    # GMT-05:00
    "America/Caracas",     # GMT-04:00
    "America/Sao_Paulo",   # GMT-03:00
    "Atlantic/South_Georgia",  # GMT-02:00
    "Atlantic/Azores",     # GMT-01:00
    "Europe/London",       # GMT+00:00
    "Europe/Berlin",       # GMT+01:00
    "Africa/Cairo",        # GMT+02:00
    "Europe/Moscow",       # GMT+03:00
    "Asia/Dubai",          # GMT+04:00
    "Asia/Karachi",        # GMT+05:00
    "Asia/Kathmandu",      # GMT+05:45
    "Asia/Kolkata",        # GMT+05:30
    "Asia/Almaty",         # GMT+06:00
    "Asia/Yangon",         # GMT+06:30
    "Asia/Bangkok",        # GMT+07:00
    "Asia/Shanghai",       # GMT+08:00
    "Asia/Tokyo",          # GMT+09:00
    "Australia/Adelaide",  # GMT+09:30
    "Australia/Sydney",    # GMT+10:00
    "Pacific/Guadalcanal", # GMT+11:00
    "Pacific/Auckland",    # GMT+12:00
    "Pacific/Chatham",     # GMT+12:45
]

SUPPORTED_TIMEZONES_SET = frozenset(SUPPORTED_TIMEZONES)

