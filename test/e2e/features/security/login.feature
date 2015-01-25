Feature: Login to my account
  As a AsyncMeeting Customer,
  I want to login into my account,
  so I can use AsyncMeeting for meetings

Scenario: Authorize access for an active and valid account
Given I have a valid and active account
And I am logged out of the system
And I request to authenticate myself
When I provide my credentials
Then I should have access to my account

@negative_test
Scenario: Deny access for an invalid account
Given I have an invalid account
And I am logged out of the system
And I request to authenticate myself
When I provide my credentials
Then I should be denied access to my account
