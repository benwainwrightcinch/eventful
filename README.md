# Eventful (working title)

A type-safe event-bridge processor

## What does it do?

Eventful provides a strongly typed API for narrowing and processing AWS
EventBridge events. You provide an input event which is a union of the
`aws-lambda` build in type `EventBridgeEvent<X, Y>` and it will allow you to
easily supply handler functions for each different event type without narrowing
or casting the types. It will fail at build time if you

* Neglect to provide a handler for each event that is part of the union
* Supply a handler that doesn't match one of the events in the union
