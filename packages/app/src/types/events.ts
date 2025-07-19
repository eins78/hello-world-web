/**
 * Event types for iCalendar feed generation
 * 
 * These types follow RFC 5545 (iCalendar) specifications
 * with additional fields for vendor-specific workarounds
 */

/**
 * Core event data structure
 */
export interface Event {
  /** Event title/summary (RFC 5545: SUMMARY) */
  title: string;
  
  /** Event start datetime in ISO 8601 format */
  startAt: string;
  
  /** Duration in minutes */
  duration: number;
  
  /** IANA timezone identifier (e.g., "Europe/Zurich") */
  timezone?: string;
  
  /** ISO datetime when event should be considered cancelled */
  cancelAt?: string;
}

/**
 * iCalendar generation options
 */
export interface ICalOptions {
  /** Calendar METHOD property (RFC 5546) */
  method: 'PUBLISH' | 'CANCEL' | 'REQUEST';
  
  /** Event STATUS property */
  status: 'CONFIRMED' | 'CANCELLED' | 'TENTATIVE';
  
  /** SEQUENCE number for updates (RFC 5545: 3.8.7.4) */
  sequence: number;
  
  /** Whether event is currently cancelled based on cancelAt */
  isCancelled: boolean;
}

/**
 * Parsed and validated event data
 */
export interface ParsedEvent extends Event {
  /** Parsed start date */
  startDate: Date;
  
  /** Calculated end date */
  endDate: Date;
  
  /** Generated unique identifier */
  uid: string;
  
  /** iCalendar generation options */
  icalOptions: ICalOptions;
}

/**
 * Query parameters for the events.ics endpoint
 */
export interface EventQueryParams {
  title?: string;
  startAt?: string;
  duration?: string;
  tz?: string;
  cancelAt?: string;
}

/**
 * Vendor-specific extensions for client compatibility
 * These are X- properties added for specific calendar clients
 */
export interface VendorExtensions {
  /** Microsoft Outlook specific properties */
  outlook?: {
    /** X-MICROSOFT-CDO-BUSYSTATUS */
    busyStatus?: 'FREE' | 'TENTATIVE' | 'BUSY' | 'OOF';
  };
  
  /** Apple Calendar specific properties */
  apple?: {
    /** X-APPLE-STRUCTURED-LOCATION */
    structuredLocation?: string;
  };
  
  /** Google Calendar hints */
  google?: {
    /** Refresh interval hint (not standard) */
    refreshInterval?: string;
  };
}

/**
 * Error response for invalid parameters
 */
export interface ErrorResponse {
  error: string;
  status: number;
}