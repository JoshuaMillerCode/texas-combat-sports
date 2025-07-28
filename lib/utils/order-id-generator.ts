import CryptoJS from 'crypto-js';

export class OrderIDGenerator {
  /**
   * Generates a unique OrderID
   * Format: ORD-{YYYYMMDD}-{randomHex}
   * Example: ORD-20241215-A1B2C3D4E5F6
   */
  static generateOrderID(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = CryptoJS.lib.WordArray.random(6)
      .toString()
      .toUpperCase();

    return `ORD-${date}-${randomPart}`;
  }

  /**
   * Generates a ticket number with event prefix
   * Format: {EVENT_PREFIX}-{YYYYMMDD}-{randomHex}
   * Example: TXCS-20241215-A1B2C3D4E5F6
   */
  static generateTicketNumber(eventPrefix: string = 'TXCS'): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = CryptoJS.lib.WordArray.random(6)
      .toString()
      .toUpperCase();

    return `${eventPrefix}-${date}-${randomPart}`;
  }

  /**
   * Validates if a string is a valid OrderID format
   */
  static isValidOrderID(orderId: string): boolean {
    const orderIdPattern = /^ORD-\d{8}-[A-F0-9]{12}$/;
    return orderIdPattern.test(orderId);
  }

  /**
   * Validates if a string is a valid ticket number format
   */
  static isValidTicketNumber(ticketNumber: string): boolean {
    const ticketNumberPattern = /^[A-Z]{2,6}-\d{8}-[A-F0-9]{12}$/;
    return ticketNumberPattern.test(ticketNumber);
  }
}
