DELIMITER $

DROP PROCEDURE IF EXISTS generate_stands_sample_data $

CREATE PROCEDURE generate_sample_data()
	MODIFIES SQL DATA

    BEGIN
    SET @current_date = CURDATE();

    DELETE FROM `stands`;

-- Insert records with dynamically calculated start and end dates
INSERT INTO `stands` (`numero`, `title`, `date_start`, `date_end`, `address`, `total_reservations`, `lng`, `ALT`, `description`, `poster_img`) VALUES
(1, 'Strawberry Hill Market', DATE_ADD(@current_date, INTERVAL 1 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 1 DAY), INTERVAL 1 DAY), '123 Main St, Boston, MA', 100, 42.3601, -71.0589, 'Locally grown, organic strawberries.', 'strawberries.jpg'),
(2, 'Beacon Honey Market', DATE_ADD(@current_date, INTERVAL 2 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 2 DAY), INTERVAL 2 DAY), '456 Beacon St, Boston, MA', 50, 42.3601, -71.0589, 'Pure, raw honey from local hives.', 'honey.jpg'),
(3, 'Egg Commons Market', DATE_ADD(@current_date, INTERVAL 3 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 3 DAY), INTERVAL 2 DAY), '789 Commonwealth Ave, Boston, MA', 200, 42.3601, -71.0589, 'Free-range, organic eggs.', 'eggs.jpg'),
(4, 'North End Jam Market', DATE_ADD(@current_date, INTERVAL 1 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 1 DAY), INTERVAL 1 DAY), '101 North End St, Boston, MA', 75, 42.3601, -71.0589, 'Delicious homemade jam made from local fruits.', 'jam.jpg'),
(5, 'Fenway Vegetable Market', DATE_ADD(@current_date, INTERVAL 2 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 2 DAY), INTERVAL 1 DAY), '202 Fenway Rd, Boston, MA', 150, 42.3601, -71.0589, 'Fresh, seasonal vegetables.', 'vegetables.jpg'),

-- Previous weeks
(6, 'Seaport Herb Market', DATE_SUB(@current_date, INTERVAL 7 DAY), DATE_SUB(DATE_SUB(@current_date, INTERVAL 7 DAY), INTERVAL 1 DAY), '303 Seaport Blvd, Boston, MA', 80, 42.3601, -71.0589, 'Aromatic herbs.', 'herbs.jpg'),
(7, 'Boston Berry Market', DATE_SUB(@current_date, INTERVAL 14 DAY), DATE_SUB(DATE_SUB(@current_date, INTERVAL 14 DAY), INTERVAL 1 DAY), '404 Boylston St, Boston, MA', 120, 42.3601, -71.0589, 'Assorted fresh berries.', 'berries.jpg'),

-- Upcoming weeks
(8, 'Flower District Market', DATE_ADD(@current_date, INTERVAL 7 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 7 DAY), INTERVAL 1 DAY), '505 Flower St, Boston, MA', 60, 42.3601, -71.0589, 'Beautiful flowers.', 'flowers.jpg'),
(9, 'Charlestown Cheese Market', DATE_ADD(@current_date, INTERVAL 14 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 14 DAY), INTERVAL 2 DAY), '606 Charlestown St, Boston, MA', 90, 42.3601, -71.0589, 'Artisanal cheeses.', 'cheese.jpg'),

-- This month
(10, 'Downtown Bread Market', DATE_ADD(@current_date, INTERVAL 3 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 3 DAY), INTERVAL 1 DAY), '707 Downtown St, Boston, MA', 130, 42.3601, -71.0589, 'Freshly baked bread.', 'bread.jpg'),
(11, 'South End Milk Market', DATE_ADD(@current_date, INTERVAL 10 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 10 DAY), INTERVAL 1 DAY), '808 South End St, Boston, MA', 140, 42.3601, -71.0589, 'Fresh, organic milk.', 'milk.jpg'),

-- All months of the year
(12, 'Cambridge Apple Market', DATE_ADD(@current_date, INTERVAL 30 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 30 DAY), INTERVAL 1 DAY), '909 Cambridge St, Boston, MA', 180, 42.3601, -71.0589, 'Crisp, fresh apples.', 'apples.jpg'),
(13, 'Brookline Pumpkin Market', DATE_ADD(@current_date, INTERVAL 60 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 60 DAY), INTERVAL 1 DAY), '1010 Brookline St, Boston, MA', 110, 42.3601, -71.0589, 'Pumpkins for pies and decorations.', 'pumpkins.jpg'),
(14, 'Back Bay Grape Market', DATE_ADD(@current_date, INTERVAL 90 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 90 DAY), INTERVAL 1 DAY), '1111 Back Bay St, Boston, MA', 160, 42.3601, -71.0589, 'Sweet, juicy grapes.', 'grapes.jpg'),
(15, 'Allston Corn Market', DATE_ADD(@current_date, INTERVAL 120 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 120 DAY), INTERVAL 1 DAY), '1212 Allston St, Boston, MA', 70, 42.3601, -71.0589, 'Fresh corn on the cob.', 'corn.jpg'),
(17, 'Roxbury Lettuce Market', DATE_ADD(@current_date, INTERVAL 180 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 180 DAY), INTERVAL 1 DAY), '1414 Roxbury St, Boston, MA', 100, 42.3601, -71.0589, 'Fresh lettuce varieties.', 'lettuce.jpg'),
(18, 'Mission Hill Onion Market', DATE_ADD(@current_date, INTERVAL 210 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 210 DAY), INTERVAL 1 DAY), '1515 Mission Hill St, Boston, MA', 80, 42.3601, -71.0589, 'Organic onions.', 'onions.jpg'),
(19, 'West End Tomato Market', DATE_ADD(@current_date, INTERVAL 240 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 240 DAY), INTERVAL 1 DAY), '1616 West End St, Boston, MA', 90, 42.3601, -71.0589, 'Juicy, ripe tomatoes.', 'tomatoes.jpg'),
(20, 'Brighton Carrot Market', DATE_ADD(@current_date, INTERVAL 270 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 270 DAY), INTERVAL 1 DAY), '1717 Brighton St, Boston, MA', 110, 42.3601, -71.0589, 'Fresh carrots.', 'carrots.jpg'),
(21, 'Dorchester Cabbage Market', DATE_ADD(@current_date, INTERVAL 300 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 300 DAY), INTERVAL 1 DAY), '1818 Dorchester St, Boston, MA', 70, 42.3601, -71.0589, 'Crisp, organic cabbage.', 'cabbage.jpg'),
(22, 'Mattapan Pepper Market', DATE_ADD(@current_date, INTERVAL 330 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 330 DAY), INTERVAL 1 DAY), '1919 Mattapan St, Boston, MA', 75, 42.3601, -71.0589, 'Sweet and spicy peppers.', 'peppers.jpg'),
(23, 'Hyde Park Squash Market', DATE_ADD(@current_date, INTERVAL 360 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 360 DAY), INTERVAL 1 DAY), '2020 Hyde Park St, Boston, MA', 85, 42.3601, -71.0589, 'Delicious squash varieties.', 'squash.jpg'),

 -- Additional creative market stand names for the new week
 (24, 'Apricot Alley', DATE_ADD(@current_date, INTERVAL 12 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 12 DAY), INTERVAL 1 DAY), '123 Farm Lane, Berrechid, Morocco', 90, 33.275232, -7.587364, 'Fresh, juicy apricots.', 'apricots.jpg'),
(25, 'Berry Bliss', DATE_ADD(@current_date, INTERVAL 13 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 13 DAY), INTERVAL 1 DAY), '123 Farm Lane, Berrechid, Morocco', 140, 33.275232, -7.587364, 'Ripe, sweet cherries.', 'cherries.jpg'),
(26, 'Blueberry Basin', DATE_ADD(@current_date, INTERVAL 14 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 14 DAY), INTERVAL 2 DAY), '123 Farm Lane, Berrechid, Morocco', 110, 33.275232, -7.587364, 'Fresh, plump blueberries.', 'blueberries.jpg'),
(27, 'Blackberry Bounty', DATE_ADD(@current_date, INTERVAL 15 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 15 DAY), INTERVAL 1 DAY), '123 Farm Lane, Berrechid, Morocco', 130, 33.275232, -7.587364, 'Juicy, sweet blackberries.', 'blackberries.jpg'),
(28, 'Raspberry Retreat', DATE_ADD(@current_date, INTERVAL 16 DAY), DATE_ADD(DATE_ADD(@current_date, INTERVAL 16 DAY), INTERVAL 1 DAY), '123 Farm Lane, Berrechid, Morocco', 120, 33.275232, -7.587364, 'Delicious, ripe raspberries.', 'raspberries.jpg');

END

$
