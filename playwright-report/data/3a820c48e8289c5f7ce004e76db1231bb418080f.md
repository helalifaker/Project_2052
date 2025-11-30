# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "War Room" [level=1] [ref=e5]
        - paragraph [ref=e6]: Compare proposals side-by-side with delta analysis.
      - generic [ref=e7]:
        - generic [ref=e8]:
          - switch "Delta View" [ref=e9]
          - generic [ref=e10] [cursor=pointer]:
            - img [ref=e11]
            - text: Delta View
        - button "Back" [ref=e16]:
          - img
          - text: Back
    - generic [ref=e17]: No proposals available for comparison.
    - paragraph [ref=e19]:
      - strong [ref=e20]: "Note:"
      - text: The first proposal (leftmost) is treated as the Baseline. Enable "Delta View" to see how other proposals compare against it.
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e26] [cursor=pointer]:
    - img [ref=e27]
  - alert [ref=e31]
```