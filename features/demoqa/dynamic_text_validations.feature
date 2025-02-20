Feature: Check dynamic text with random ID

    Scenario: Verify that the text matches the expected text using a text-based selector
        Given a user named Jairo navigate to the dynamic content page
        Then he should see that the text "This text has random Id" equals the expected text

    Scenario: Verify the text matches expected text usign a dynamic ID-based selector
        Given a user named Jairo navigate to the dynamic content page
        Then he should see that the text "This text has random Id" equals the expected text locating the element by a dynamic ID 