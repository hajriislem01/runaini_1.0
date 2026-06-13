import re
import sys

path = r'c:\Users\zied\Desktop\runaini_1.0-main\runaini_1.0-main\frontend\src\pages\coach\CoachAgenda.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

def replace(old, new):
    global content
    content = content.replace(old, new)

# We will implement helper formatters for the dates
formatters = """
  const tMonth = (d) => t(`months.${format(d, 'MMM').toLowerCase()}`);
  const tMonthLong = (d) => t(`months.${format(d, 'MMMM').toLowerCase()}`);
  const tDay = (d) => t(`days.${format(d, 'EEE').toLowerCase()}`);
  const tDayLong = (d) => t(`days.${format(d, 'EEEE').toLowerCase()}`);
"""

# Inject formatters after isRTL
replace(
    "const isRTL = i18n.language === 'ar';",
    "const isRTL = i18n.language === 'ar';\n" + formatters
)

# Toast messages
replace("'Failed to load agenda'", "t('toast.load_error')")
replace("'Date is required'", "t('toast.date_required')")
replace("'Session updated ✅'", "t('toast.update_success')")
replace("'Failed to update session'", "t('toast.update_error')")
replace("'Session deleted ✅'", "t('toast.delete_success')")
replace("'Failed to delete session'", "t('toast.delete_error')")

# Categories array mapping (they are mapped via getCat, but getCat returns hardcoded labels if we don't translate them there. Better to translate inside getCat or render)
# Actually, the labels in CATEGORIES are not used if we translate them during render.
replace("{c.label}", "{t(`categories.${cKey}`) || c.label}")
replace("{badgeConfig.label}", "{t(`categories.${s.type === 'Meeting' ? 'meeting' : s.type === 'Match Friendly' ? 'friendly' : 'tournament'}`)}")
# For getCat(categories[0]) which returns cat...
replace("{cat.label}", "{t(`categories.${s.category?.[0] || 'technical'}`) || cat.label}")
# wait, cat.label is used in a few places:
# `<span>{cat.label}</span>`
# Let's just do a specific replace for the categories render
replace(">{c.label}</span>", ">{t(`categories.${cKey}`)}</span>")
replace(">{badgeConfig.label}</span>", ">{t(`categories.${s.type === 'Meeting' ? 'meeting' : s.type === 'Match Friendly' ? 'friendly' : 'tournament'}`)}</span>")
replace(">{cat.label}</span>", ">{t(`categories.${Array.isArray(s.category) ? s.category[0] : s.category}`) || cat.label}</span>")

# Card Badges & Info
replace("'Agenda Item'", "t('event.agenda_item')")
replace("`Level ${s.level}`", "`${t('event.level')} ${s.level}`")
replace("Team Training", "{t('event.team_training')}")
replace("recurring", "{t('event.recurring')}")
replace(">Past<", ">{t('event.past')}<")

# Card Exercises
replace("{s.participants_count} players", "{s.participants_count} {t('event.players')}")
replace("Players", "{t('event.players')}")
replace("exercises", "{t('event.exercises')}")
replace("more exercises", "{t('event.more_exercises')}")

# Card Actions
replace(">Edit<", ">{t('event.edit')}<")
replace(">Delete this<", ">{t('event.delete_this')}<")
replace(">Delete all<", ">{t('event.delete_all')}<")
replace(">Delete<", ">{t('event.delete')}<")

# Stats labels
replace("'This month'", "t('stats.this_month')")
replace("'This week'", "t('stats.this_week')")
replace("'Today'", "t('stats.today')")
replace("'Recurring'", "t('stats.recurring')")
replace("sessions scheduled", "{t('stats.sessions_scheduled')}")
replace("{daySessions.length} session{daySessions.length > 1 ? 's' : ''}", "{daySessions.length} {t('stats.session_s')}")
replace("{viewingSessions.length} session{viewingSessions.length !== 1 ? 's' : ''} scheduled", "{viewingSessions.length} {t('stats.session_s')} {t('stats.sessions_scheduled')}")

# View Empty States
replace("No upcoming sessions", "{t('empty.no_upcoming')}")
replace("Create a session to get started", "{t('empty.click_to_add')}")
replace("No sessions scheduled for this day", "{t('empty.no_day_sessions')}")
replace("Add Session for This Day", "{t('empty.add_for_day')}")
replace("Create session", "{t('event.create_session')}")

# Filters
replace(">Filters<", ">{t('filters.title')}<")
replace(">Clear all<", ">{t('filters.clear_all')}<")
replace(">Recurring only<", ">{t('filters.recurring_only')}<")

# Date replacements
# {format(currentDate, 'MMMM yyyy')} -> {tMonthLong(currentDate)} {format(currentDate, 'yyyy')}
replace("{format(currentDate, 'MMMM yyyy')}", "{tMonthLong(currentDate)} {format(currentDate, 'yyyy')}")

# {isT ? 'Today' : format(parseISO(s.date), 'EEE MMM d')}
replace("{isT ? 'Today' : format(parseISO(s.date), 'EEE MMM d')}", "{isT ? t('controls.today') : `${tDay(parseISO(s.date))} ${tMonth(parseISO(s.date))} ${format(parseISO(s.date), 'd')}`}")

# {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
#   <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
# ))}
replace("{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (\\n                <div key={d} className=\"text-center text-xs font-semibold text-gray-500 py-2\">{d}</div>", "{['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(d => (\\n                <div key={d} className=\"text-center text-xs font-semibold text-gray-500 py-2\">{t(`days.${d}`)}</div>")

# {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
replace("{format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}", "{tMonth(weekDays[0])} {format(weekDays[0], 'd')} – {tMonth(weekDays[6])} {format(weekDays[6], 'd, yyyy')}")

# {WEEK_DAYS[i]}
replace("{WEEK_DAYS[i]}", "{t(`days.${WEEK_DAYS[i].toLowerCase()}`)}")

# {format(d, 'EEEE, MMMM d, yyyy')}
replace("{format(d, 'EEEE, MMMM d, yyyy')}", "{tDayLong(d)}, {tMonthLong(d)} {format(d, 'd, yyyy')}")

# {isToday(viewingDay) ? 'Today — ' : ''}{format(viewingDay, 'EEEE, MMMM d, yyyy')}
replace("{isToday(viewingDay) ? 'Today — ' : ''}{format(viewingDay, 'EEEE, MMMM d, yyyy')}", "{isToday(viewingDay) ? `${t('controls.today')} — ` : ''}{tDayLong(viewingDay)}, {tMonthLong(viewingDay)} {format(viewingDay, 'd, yyyy')}")

# Modal strings
replace("'This is a recurring session. Editing will only update this specific occurrence.'", "t('modal.recurrence_warning')")
replace("'This will delete ALL occurrences of this recurring session. This action cannot be undone.'", "t('modal.delete_all_warning')")
replace("'This will delete only this session. This action cannot be undone.'", "t('modal.delete_single_warning')")

# The text itself inside the div (since it's not a JS string there)
replace("This is a recurring session. Editing will only update this specific occurrence.", "{t('modal.recurrence_warning')}")
replace("This will delete ALL occurrences of this recurring session. This action cannot be undone.", "{t('modal.delete_all_warning')}")
replace("This will delete only this session. This action cannot be undone.", "{t('modal.delete_single_warning')}")

# Today string in the button
replace(">This week<", ">{t('controls.this_week')}<")

# Update view list "Today — "
replace("{todayDay ? 'Today — ' : ''}", "{todayDay ? `${t('controls.today')} — ` : ''}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
