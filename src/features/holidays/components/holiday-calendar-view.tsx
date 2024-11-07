"use client"

import { Calendar } from "@/components/ui/calendar"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { HolidayWithUser } from "../types"

interface HolidayCalendarViewProps {
    holidays: HolidayWithUser[]
}

export function HolidayCalendarView({ holidays }: HolidayCalendarViewProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

    // Create a map of dates to holidays for efficient lookup
    const holidayMap = holidays.reduce((acc, holiday) => {
        const date = new Date(holiday.date).toDateString()
        if (!acc[date]) {
            acc[date] = []
        }
        acc[date].push(holiday)
        return acc
    }, {} as Record<string, HolidayWithUser[]>)

    // Custom day render to show holiday indicators
    const dayRender = (date: Date) => {
        const dateString = date.toDateString()
        const dayHolidays = holidayMap[dateString] || []

        if (dayHolidays.length === 0) return null

        return (
            <div className="w-full h-full relative">
                <Badge
                    variant={dayHolidays[0].type === "Regular" ? "default" : "secondary"}
                    className="absolute bottom-0 left-0 right-0 rounded-none text-[10px] px-0.5"
                >
                    {dayHolidays[0].name}
                </Badge>
            </div>
        )
    }

    // Show details of selected date
    const selectedHolidays = selectedDate
        ? holidayMap[selectedDate.toDateString()] || []
        : []

    return (
        <div className="grid md:grid-cols-[1fr,300px] gap-4">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                components={{
                    Day: ({ date }) => dayRender(date),
                }}
            />

            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <h3 className="font-medium">
                            {selectedDate?.toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </h3>
                        {selectedHolidays.length > 0 ? (
                            <div className="space-y-2">
                                {selectedHolidays.map((holiday) => (
                                    <div key={holiday._id} className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={
                                                holiday.type === "Regular" ? "default" : "secondary"
                                            }>
                                                {holiday.type}
                                            </Badge>
                                            <span className="font-medium">{holiday.name}</span>
                                        </div>
                                        {holiday.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {holiday.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No holidays on this date
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 