# Hindi TTS Module

This repository is the focused Hindi workflow/reference module for Nagar Studio.

The production architecture is now centralized in `Nagar-Voice-Studio`: provider selection, pronunciation rules, voice profiles, jobs and exports should not be forked here.

Use this project for Hindi-specific UI/experiments and migrate proven logic into Nagar Studio's shared voice core.

Runtime contract: the production TTS provider must report real capability state; configured API credentials alone are not proof of successful inference.
