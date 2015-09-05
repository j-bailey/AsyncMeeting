Feature: Login to my account
  As a AsyncMeeting Customer,
  I want to login into my account,
  so I can use AsyncMeeting for meetings


  Scenario Outline: Authorize access for an active and valid account
    Given I have a valid and active account with username <saved username>, email <email>, and password <password>
    And I am logged out of the system
    And I request to authenticate myself
    When I provide my credentials of username <username>, email <email>, and password <password>
    Then I should have access to my account

    Examples:
      | saved username       | username             | email                                       | password                                   | description                |
      | User@1               | User@1               | user@user.com                               | Pword#123                                  | simple account             |
      | User123456789012345@ | User123456789012345@ | user1@user.com                              | Pword#123                                  | Longest alloed username    |
      | Usr                  | Usr                  | user2@user.com                              | Pword#123                                  | Shortetst allowed username |
      | User#3               | User#3               | user123456789012345678901234567890@user.com | Pword#123                                  | Longest alloed email       |
      | USer#4               | User#4               | u@u.c                                       | Pword#123                                  | Shortetst allowed email    |
      | User#5               | User#5               | user5@user.com                              | Password#123123456789012345678901234567890 | Longest alloed password    |
      | User#6               | User#6               | user6@user.com                              | Pass#123                                   | Shortetst allowed password |

#    TODO Expand this negative test
  @negative_test @WIP @element_comparison
  Scenario: Deny access for an invalid account
    Given I have an invalid account
    And I am logged out of the system
    And I request to authenticate myself
    When I provide my credentials
    Then I should be denied access to my account


