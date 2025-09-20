CREATE TABLE `Image` (
	`id` text PRIMARY KEY NOT NULL,
	`ticketId` text NOT NULL,
	`content` blob,
	`usedAt` numeric,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `image_ticketId_idx` ON `Image` (`ticketId`);--> statement-breakpoint
CREATE TABLE `Ticket` (
	`id` text PRIMARY KEY NOT NULL,
	`ua` text NOT NULL,
	`ip` text NOT NULL,
	`referrer` text NOT NULL,
	`contact` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'OPEN' NOT NULL,
	`relatedTo` text,
	`createdAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updatedAt` numeric DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ticket_updatedAt_index` ON `Ticket` (`updatedAt`);--> statement-breakpoint
CREATE INDEX `ticket_createdAt_index` ON `Ticket` (`createdAt`);--> statement-breakpoint
CREATE INDEX `ticket_status_index` ON `Ticket` (`status`);