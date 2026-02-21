

# Add Booking Numbers to Room Cards

## Overview

Each room in a multi-room booking can have its own unique booking numbers (e.g., an Encore number and a cruise line booking number). These need to be stored per-room and always displayed beside the room label, even when they are the same across rooms.

## Changes

### 1. Update RoomData Interface

Add `booking_number` and `cruise_line_booking_number` fields to the `RoomData` interface.

### 2. Update RoomCard Display

Show the booking numbers right beside the room label (e.g., "Room 1 -- 60013383 / CL-12345"). They will always be displayed regardless of whether they match other rooms.

### 3. Update Auto-Migration

When migrating legacy data into Room 1, carry over the top-level `booking_number` and `cruise_line_booking_number` fields into the room object.

### 4. AI Extraction

When the "Add Room" dialog processes uploaded documents, the AI already extracts booking numbers. The frontend will slot `booking_number` and `cruise_line_booking_number` from the AI response into the new room entry.

## Technical Details

### File: `src/pages/BookingReport.tsx`

**RoomData interface (line 25)** -- add two fields:

```typescript
interface RoomData {
  room_number: number;
  label: string;
  passengers: any[];
  cabin_number?: string;
  cabin_category?: string;
  deck?: string;
  bed_configuration?: string;
  pricing?: any;
  booking_number?: string;
  cruise_line_booking_number?: string;
}
```

**RoomCard component (line 260-278)** -- add booking numbers beside the room label:

```typescript
<h3 className="text-sm font-semibold flex items-center gap-2">
  <BedDouble className="h-4 w-4 text-primary" /> {room.label}
</h3>
{(room.booking_number || room.cruise_line_booking_number) && (
  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
    {room.booking_number && (
      <Badge variant="secondary" className="text-[10px] font-mono">
        #{room.booking_number}
      </Badge>
    )}
    {room.cruise_line_booking_number && (
      <Badge variant="outline" className="text-[10px] font-mono">
        CL: {room.cruise_line_booking_number}
      </Badge>
    )}
  </div>
)}
```

**Auto-migration (line 431-440)** -- include booking numbers when building Room 1:

```typescript
const room1: RoomData = {
  // ...existing fields...
  booking_number: details.booking_number || undefined,
  cruise_line_booking_number: details.cruise_line_booking_number || undefined,
};
```

**Add Room handler** -- when appending a new room from AI results, also map `booking_number` and `cruise_line_booking_number` from the AI response into the new room object.

