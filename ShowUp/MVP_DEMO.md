# 🚀 ShowUp MVP Demo Guide

## 📋 Overview
This demo shows the complete user flow for your ShowUp dApp using the deployed contracts.

## 🏗️ Deployed Contracts
- **ShowUpEvents**: `0xa19273383554e1e1` ✅
- **ShowUpStaking**: `0xa19273383554e1e1` ✅

## 🎯 MVP User Flow

### 1. 🎪 **Organizer Creates Event**
```bash
# Create a test event
flow transactions send cadence/transactions/CreateTestEvent.cdc \
  "test-event-123" \
  "Weekly Standup" \
  "Team standup meeting" \
  "2024-01-15" \
  "Office Conference Room" \
  1.0 \
  10 \
  --signer mainnet-account \
  --network mainnet
```

### 2. 👤 **User Registers & Stakes**
```bash
# User stakes money for the event
flow transactions send cadence/transactions/StakeForEvent.cdc \
  "test-event-123" \
  "alice_dev" \
  1.0 \
  --signer user-account \
  --network mainnet
```

### 3. ✅ **Event Happens & Check-ins**
```bash
# Organizer checks in attendees
flow transactions send cadence/transactions/CheckInUser.cdc \
  "test-event-123" \
  "alice_dev" \
  --signer mainnet-account \
  --network mainnet
```

### 4. 💰 **Stakes Released/Forfeited**
```bash
# Return stakes to attendees
flow transactions send cadence/transactions/ReturnStakes.cdc \
  "test-event-123" \
  --signer mainnet-account \
  --network mainnet

# Forfeit stakes from no-shows (goes to you!)
flow transactions send cadence/transactions/ForfeitNoShows.cdc \
  "test-event-123" \
  --signer mainnet-account \
  --network mainnet
```

## 📊 **Analytics & Tracking**
```bash
# View event stats
flow scripts execute cadence/scripts/GetEventStats.cdc "test-event-123" --network mainnet

# Check your revenue from forfeited stakes
flow scripts execute cadence/scripts/GetCreatorBalance.cdc --network mainnet
```

## 💡 **Revenue Model**
- ✅ **User shows up**: Gets their money back
- ❌ **User no-shows**: Money goes to YOU (platform revenue)
- 📈 **Higher no-show rates** = More revenue for platform development

## 🎮 **Frontend Integration Points**
1. **Event Creation Form**: Simple form with stake amount
2. **Registration Page**: Username + wallet connection
3. **Organizer Dashboard**: List of registered users with check-in buttons
4. **Analytics Dashboard**: Revenue tracking and event statistics

## 🚀 **Next Steps**
1. Test the complete flow manually
2. Build simple frontend components
3. Add batch processing for multiple events
4. Scale to handle more complex event types

This MVP gives you:
- ✅ **Proven Revenue Model**: Platform earns from no-shows
- ✅ **Simple UX**: Easy for organizers and users
- ✅ **Scalable Architecture**: Can handle growth
- ✅ **Real Value**: Solves actual attendance problems
