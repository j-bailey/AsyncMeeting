Feature: Register for an account
  As a potential customer,
  I want to register for an account,
  so I can use AsyncMeeting

# TODO need to add an account type to the process
  @register
  Scenario Outline: Register with valid credentials
    Given System does not have any registration credentials
    And I am at registration point
    When I provide my username <username> for registration
    And I provide my email <email> for registration
    And I provide my password <password> for registration
#    And I reconfirm my password <password> for registration
    And I submit for registration
#    Then I see a registration confirmation
    Then I am offered to login to the system

    Examples:
      | username               | email                                                   | password | description                   |
      | Us#1                   | u@u.c                                                   | aA123#   | shortest values               |
      | Abcdefghijklmnopq1#    | abcdefghijklmnopqrstuvxyz@abcdefghijklmnopqrstuvxyz.com | aA123#   | longest values                |
#      | u!@#$%^&*()\|\]}[{'";: | u!$%^&*\|}{'/?`~@user.com                               | aA123#   | acceptable special characters |
#      | u:/>?<,`~              | u!$%^&*\|}{'/?`~@user.com                               | aA123#   | acceptable special characters |

#      TODO Figure out how to handle HTML 5 validation messages
#  @negative_test
#  Scenario Outline: Attempt to register with invalid credentials
#    Given System does not have any registration credentials
#    And I am at registration point
#    When I provide an invalid registration value of <value> in field <field>
#    And I submit for registration
#    Then The screenshot will look like invalid registration reference image for invalid field <field> with value <value>
#
#    Examples:
#      | field    | value | description           |
#      | username |       | Number only username |

  @WIP
  Scenario Outline: See password strength and acceptance
    Given System does not have any registration credentials
    And I am at registration point
    When I provide my password <password> for registration
    Then I see password strength of <strength>
    But I see no message of being an unacceptable password

    Examples:
      | password     | strength | description              |
      | Password#123 | medium   | lowest possible password |
      | P123@#$ds87f | strong   | Strongest password       |

#    TODO Add common bad passwords
  @negative_test @WIP
  Scenario Outline: See passwords fail due to strength
    Given System does not have any registration credentials
    And I am at registration point
    When I provide my password <password> for registration
    Then I see a message of being an unacceptable password

    Examples:
      | password     | strength | description        |
      | Password     | medium   | dictionary words   |
      | P123@#$ds87f | strong   | Strongest password |
