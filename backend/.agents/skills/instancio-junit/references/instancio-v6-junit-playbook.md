# Instancio v6 + JUnit 5 Playbook

## Purpose

Use Instancio v6 to reduce manual fixture setup while keeping tests expressive and reproducible.

## Core Patterns

### 1) Create complete objects quickly

Use create() for defaults:

```java
Order order = Instancio.create(Order.class);
```

Use builder API for customization:

```java
Order order = Instancio.of(Order.class)
    .generate(Select.field(Order::getStatus), gen -> gen.oneOf(Status.NEW, Status.PAID))
    .create();
```

### 2) Build reusable models

```java
Model<Customer> customerModel = Instancio.of(Customer.class)
    .ignore(Select.field(Customer::getInternalNotes))
    .generate(Select.field(Customer::getEmail), gen -> gen.net().email())
    .toModel();

Customer customer = Instancio.create(customerModel);
```

### 3) Keep test invariants fixed

Use set() for fixed values:

```java
Invoice invoice = Instancio.of(Invoice.class)
    .set(Select.field(Invoice::getCurrency), "USD")
    .create();
```

### 4) Populate existing instances

```java
Payment payment = new Payment();
payment.setCreatedAt(existingTimestamp);

Instancio.ofObject(payment)
    .generate(Select.field(Payment::getReference), gen -> gen.text().uuid())
    .fill();
```

fill() keeps non-null and non-default primitive fields unchanged by default.

### 5) Define relationships with assign()

```java
Order order = Instancio.of(Order.class)
    .assign(Assign.given(Order::getStatus)
        .is(Status.CANCELLED)
        .set(Order::getCancelledAt, Instant.now()))
    .create();
```

## Selector Guidance

- Prefer Select.field(Class::getter) for precise matching.
- Use Select.all(Type.class) only when broad behavior is intended.
- Predicate selectors are flexible but easier to misuse.
- If multiple selectors match, the last one wins.
- Field selectors override type selectors.

## Scope and Depth Tips

Use within(...) when the same type appears in multiple branches.

```java
Scope shipping = Select.field(Order::getShippingAddress).toScope();

Order order = Instancio.of(Order.class)
    .set(Select.field(Address::getCountry).within(shipping), "US")
    .create();
```

Use atDepth(...) to limit nested targets.

## Strict Mode Troubleshooting

Common UnusedSelectorException causes:

- Wrong class in all(Class)
- Field renamed in production code
- Selector too broad or too narrow

Debug sequence:

1. Replace predicate selector with explicit field selector.
2. Verify exact declaring class for field().
3. Add lenient() only when optional matching is intentional.

## Reproducibility Pattern

When diagnosing flaky tests, record the failing seed and rerun with it.
Keep randomness broad in normal runs, deterministic in investigations.

## JUnit Structure

- Arrange with Instancio generation.
- Act with target method.
- Assert behavior, not random values.

Prefer assertions on constraints and invariants over exact generated values.
