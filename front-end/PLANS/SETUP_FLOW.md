1. Name

2. Avatar image
Choose an image from device to upload as the avatar. This image will immediatly be stored to `avatars` storage bucket on supabase and the url will be returned for the users `avatar_url` attribute.
`users.avatar_url`

3. Short bio

4. Prompts
This part will display 2 prompt response pairs with the option for the user to change the prompt and write in their response for that prompt. This will be very simialr to how hinge has it.
Prompts will be combined as a list of json objects:
[{ prompt: "", response: "" }, { prompt: "", response: "" }]
There will only be 2 of these objects.
`users.prompts`

5. (S) Location
Either ask for users exact location or allow them to choose a city area. Store the lat and lng coords.

6. (S) Age range
Slider for min and max age range.

7. (S) Alcohol?
Yes or No question

8. (S) Budget
Opion between low, medium or high. These will only be displayed as $, $$, and $$$ icons to the user. These will represent:
"low", "medium", "high" strings

9. (S) Vibe
This is where the user can just yap away their "vibes".They can type up to 200 words to describe their hobbies and itnerests and what they do in their free time. 

All of the data (marked by S), except for the name, will be parsed into an interests object as key value pairs
`users.interests`

Also generate here the data structure of the interests json object.