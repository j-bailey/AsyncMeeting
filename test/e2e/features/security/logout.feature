Feature: Logout
  As a customer,
  I want to end my session,
  so my account is not available to anyone on my system

  @WIP
  Scenario: Logout of the system
    Given I am logged into the sysyetm
    When I logout
    Then I see logout message stating ""
    And I see a link to log back in