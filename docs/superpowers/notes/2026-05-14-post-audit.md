# Post-body Compatibility Audit

## jQuery / Bootstrap Usage

No posts contain `data-toggle`, `carousel`, or `modal` Bootstrap attributes.
No posts contain jQuery globals (`$`, `jQuery`).
Some posts contain FontAwesome classes (`fa fa-*`), which are acceptable for this v1 redesign and will fail gracefully.

No post rewrites were necessary.
