# Instancio v6 Recipe Catalog

## Recipe 1: Entity with one overridden field

```java
User user = Instancio.of(User.class)
    .set(Select.field(User::getRole), Role.ADMIN)
    .create();
```

## Recipe 2: Collection with explicit size

```java
List<Submission> submissions = Instancio.ofList(Submission.class)
    .size(8)
    .create();
```

## Recipe 3: Generic collection

```java
List<Pair<String, Integer>> pairs = Instancio.ofList(new TypeToken<Pair<String, Integer>>() {})
    .size(5)
    .create();
```

## Recipe 4: Nested graph with scope

```java
Scope homeScope = Select.field(Person::getHomeAddress).toScope();

Person person = Instancio.of(Person.class)
    .set(Select.field(Address::getCity).within(homeScope), "Athens")
    .create();
```

## Recipe 5: Constrained string generator

```java
Account account = Instancio.of(Account.class)
    .generate(Select.field(Account::getUsername), gen -> gen.string().minLength(8).maxLength(12))
    .create();
```

## Recipe 6: Conditional assignment

```java
Order order = Instancio.of(Order.class)
    .assign(Assign.given(Order::getStatus)
        .is(Status.CANCELLED)
        .set(Order::getReason, "Customer request")
        .elseSet(Order::getReason, "N/A"))
    .create();
```

## Recipe 7: Fill partially initialized object

```java
Profile profile = new Profile();
profile.setEmail("existing@example.com");

Instancio.fill(profile);
```

## Recipe 8: Stream-based test data

```java
List<Customer> customers = Instancio.stream(Customer.class)
    .limit(20)
    .toList();
```

Always call limit() on Instancio streams.

## Recipe 9: Replace one subtree with setBlank

```java
Order order = Instancio.ofBlank(Order.class)
    .set(Select.field(Order::getStatus), Status.NEW)
    .create();
```

## Recipe 10: Strict-mode safe selector layering

```java
Address address = Instancio.of(Address.class)
    .set(Select.allStrings(), "X")
    .set(Select.field(Address::getCity), "Thessaloniki")
    .create();
```

Field selector takes precedence over type selector.
