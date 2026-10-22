import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { theme } from "../../../../../theme/theme";
import { INotificationResponse, MessageType } from "../../../../types/Notification";
import { WEEKDAYS_PT } from "./AgendaMonthHeader";

interface AgendaCalendarGridProps {
  currentMonthDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: INotificationResponse[];
  finishedEventIds: string[];
  today: Date;
  getMessageTypeColor: (type?: MessageType) => string;
}

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const parseEventDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

export const AgendaCalendarGrid: React.FC<AgendaCalendarGridProps> = ({
  currentMonthDate,
  selectedDate,
  onSelectDate,
  events,
  finishedEventIds,
  today,
  getMessageTypeColor,
}) => {
  const generateMonthDays = () => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, lastDateOfPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Dias do mês atual
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Dias do próximo mês para fechar a grade (múltiplo de 7)
    const remainingDays = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((ev) => {
      const evDate = parseEventDate(ev.eventDate || ev.limitDate || ev.createdAt);
      return evDate ? isSameDay(evDate, date) : false;
    });
  };

  return (
    <View>
      {/* DIAS DA SEMANA */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS_PT.map((w, idx) => (
          <Text key={idx} style={styles.weekdayText}>
            {w}
          </Text>
        ))}
      </View>

      {/* GRADE DO MÊS */}
      <View style={styles.calendarGrid}>
        {generateMonthDays().map((dayItem, index) => {
          const isTodayDay = isSameDay(dayItem.date, today);
          const isSelected = isSameDay(dayItem.date, selectedDate);
          const dayEvents = getEventsForDate(dayItem.date);
          const hasEvents = dayEvents.length > 0;

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              onPress={() => onSelectDate(dayItem.date)}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.dayNumberWrapper,
                  isSelected && styles.selectedDayWrapper,
                  isTodayDay && !isSelected && styles.todayDayWrapper,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    !dayItem.isCurrentMonth && styles.otherMonthDayText,
                    isTodayDay && !isSelected && styles.todayDayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {dayItem.date.getDate()}
                </Text>
              </View>

              {/* PONTOS DE EVENTO NO DIA */}
              <View style={styles.eventDotsContainer}>
                {hasEvents &&
                  dayEvents.slice(0, 3).map((ev, i) => {
                    const isFin =
                      ev.finished ||
                      ev.completed ||
                      finishedEventIds.includes(ev.id);
                    const deadline = parseEventDate(ev.limitDate || ev.eventDate);
                    const isOver =
                      !isFin && deadline
                        ? deadline.getTime() < new Date().getTime()
                        : false;

                    return (
                      <View
                        key={i}
                        style={[
                          styles.eventDot,
                          {
                            backgroundColor: isOver
                              ? "#D32F2F"
                              : isFin
                              ? "#2E7D32"
                              : getMessageTypeColor(ev.messageType),
                          },
                        ]}
                      />
                    );
                  })}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weekdaysRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  weekdayText: {
    flex: 1,
    textAlign: "center",
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    opacity: 0.6,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dayCell: {
    width: "14.28%",
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumberWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedDayWrapper: {
    backgroundColor: theme.colors.primary,
  },
  todayDayWrapper: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontWeight: theme.typography.fontWeight.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
  },
  otherMonthDayText: {
    opacity: 0.25,
  },
  todayDayText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  selectedDayText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontWeight: theme.typography.fontWeight.bold,
  },
  eventDotsContainer: {
    flexDirection: "row",
    gap: 2,
    height: 4,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
