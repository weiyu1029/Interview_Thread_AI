Feature: CareerProof Agent

  Scenario: Decode a job description
    Given a candidate provides a job description
    When the agent analyzes the role
    Then it should identify the business problem behind the role
    And it should extract hiring signals
    And it should identify relevant industry interview context

  Scenario: Map experience to evidence
    Given a candidate provides a profile
    When the agent analyzes fit
    Then it should map real experience to hiring evidence
    And it should not invent experience

  Scenario: Protect personal information
    Given the candidate profile contains email, phone number, or LinkedIn URL
    When the agent processes the profile
    Then it should redact sensitive personal information before analysis

  Scenario: Identify weak evidence
    Given a job description requires skills not shown in the candidate profile
    When the agent performs gap analysis
    Then it should mark the evidence as weak or missing
    And recommend concrete preparation actions

  Scenario: Generate interview strategy
    Given role signals, industry context, and candidate evidence
    When the agent builds a prep report
    Then it should output role problem mapping, evidence matrix, interview story bank, likely questions, and a 7-day prep plan
