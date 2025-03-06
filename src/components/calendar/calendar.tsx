'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin, { EventResizeDoneArg } from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import listPlugin from '@fullcalendar/list'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import { type EventSourceInput, EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import { ResourceInput } from '@fullcalendar/resource'

interface CalendarProps {
  events?: EventSourceInput
  resources?: ResourceInput[]
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek' | 'resourceTimeline'
  height?: string | number
  onEventClick?: (arg: EventClickArg) => void
  onSelect?: (arg: DateSelectArg) => void
  onEventDrop?: (arg: EventDropArg) => void
  onEventResize?: (arg: EventResizeDoneArg) => void
}

/**
 * Calendar component that wraps FullCalendar with theme support and common configurations
 * 
 * @param {CalendarProps} props - The component props
 * @returns {JSX.Element} The calendar component
 */
export function Calendar({
  events,
  resources,
  view = 'dayGridMonth',
  height = 'auto',
  onEventClick,
  onSelect,
  onEventDrop,
  onEventResize,
}: CalendarProps) {
  const { theme } = useTheme()
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    const calendar = calendarRef.current
    if (calendar) {
      const calendarApi = calendar.getApi()
      calendarApi.updateSize()
    }
  }, [])

  return (
    <div className={`calendar-wrapper ${theme === 'dark' ? 'fc-dark' : ''}`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          multiMonthPlugin,
          listPlugin,
          resourceTimelinePlugin,
        ]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        height={height}
        events={events}
        resources={resources}
        eventClick={onEventClick}
        select={onSelect}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        // Theme-specific options
        themeSystem="standard"
        eventColor={theme === 'dark' ? '#3b82f6' : '#2563eb'}
        eventTextColor={theme === 'dark' ? '#ffffff' : '#ffffff'}
        // Additional configurations
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={true}
        nowIndicator={true}
        stickyHeaderDates={true}
        // Resource view specific options
        resourceAreaWidth="15%"
        resourceLabelContent="Resources"
      />
    </div>
  )
} 