'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import resourceTimelinePlugin from '@fullcalendar/resource-timeline'
import { type EventSourceInput } from '@fullcalendar/core'

interface CalendarProps {
  events?: EventSourceInput
  resources?: any[]
  view?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek' | 'resourceTimeline'
  height?: string | number
  onEventClick?: (info: any) => void
  onDateSelect?: (info: any) => void
  onEventDrop?: (info: any) => void
  onEventResize?: (info: any) => void
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
  onDateSelect,
  onEventDrop,
  onEventResize,
}: CalendarProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait for client-side hydration to prevent theme mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`calendar-wrapper ${theme === 'dark' ? 'fc-dark' : ''}`}>
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          listPlugin,
          resourceTimelinePlugin,
        ]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,resourceTimeline',
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
        select={onDateSelect}
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
        resourceLabelText="Resources"
      />
    </div>
  )
} 